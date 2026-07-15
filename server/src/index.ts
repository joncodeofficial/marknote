import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'
import { createClient } from '@libsql/client/http'
import bcrypt from 'bcryptjs'
import {
  authSchema,
  createNoteSchema,
  idParamSchema,
  reorderSchema,
  updateNoteSchema,
} from './schemas'

type Bindings = {
  TURSO_URL: string
  TURSO_AUTH_TOKEN: string
  MASTER_PASSWORD_HASH: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Hook compartido: uniforma la respuesta 400 cuando falla la validación de zod
const onValidationError: Parameters<typeof zValidator>[2] = (result, c) => {
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    return c.json({ error: 'Validation failed', details }, 400)
  }
}

function getDb(env: Bindings) {
  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })
}

const NOTE_SELECT = `
  id,
  name,
  content,
  strftime('%Y-%m-%dT%H:%M:%fZ', created_at) AS created_at,
  strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) AS updated_at
`

const NOTE_LIST_SELECT = `
  id,
  name,
  strftime('%Y-%m-%dT%H:%M:%fZ', created_at) AS created_at,
  strftime('%Y-%m-%dT%H:%M:%fZ', updated_at) AS updated_at
`

// POST /auth — verifica la password y devuelve un JWT (expira en 1h)
app.post('/auth', zValidator('json', authSchema, onValidationError), async (c) => {
  const { password } = c.req.valid('json')
  const valid = await bcrypt.compare(password, c.env.MASTER_PASSWORD_HASH)
  if (!valid) throw new HTTPException(401, { message: 'Unauthorized' })

  const token = await sign(
    { iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    c.env.JWT_SECRET
  )
  return c.json({ token })
})

// Middleware JWT — protege todas las rutas /notes
app.use('/notes/*', async (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' })
  return jwtMiddleware(c, next)
})

// GET /notes — listar todas las notas (sin content)
app.get('/notes', async (c) => {
  const db = getDb(c.env)
  const result = await db.execute(
    `SELECT ${NOTE_LIST_SELECT} FROM notes ORDER BY "order" ASC, updated_at DESC`
  )
  return c.json(result.rows)
})

// PUT /notes/reorder — actualizar orden de notas
app.put('/notes/reorder', zValidator('json', reorderSchema, onValidationError), async (c) => {
  const db = getDb(c.env)
  // Migración lazy: añadir columna order si no existe
  try {
    await db.execute('ALTER TABLE notes ADD COLUMN "order" INTEGER DEFAULT 0')
  } catch {
    // columna ya existe, ignorar
  }
  const { ids } = c.req.valid('json')
  const stmts = ids.map((id, index) => ({
    sql: 'UPDATE notes SET "order" = ? WHERE id = ?',
    args: [index, id],
  }))
  await db.batch(stmts)
  return c.json({ success: true })
})

// GET /notes/:id — nota completa con markdown
app.get('/notes/:id', zValidator('param', idParamSchema, onValidationError), async (c) => {
  const db = getDb(c.env)
  const { id } = c.req.valid('param')
  const result = await db.execute({
    sql: `SELECT ${NOTE_SELECT} FROM notes WHERE id = ?`,
    args: [id],
  })
  if (result.rows.length === 0) throw new HTTPException(404, { message: 'Not found' })
  return c.json(result.rows[0])
})

// POST /notes — crear nota
app.post('/notes', zValidator('json', createNoteSchema, onValidationError), async (c) => {
  const db = getDb(c.env)
  const { name, content } = c.req.valid('json')
  const result = await db.execute({
    sql: `INSERT INTO notes (name, content, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now')) RETURNING ${NOTE_SELECT}`,
    args: [name, content],
  })
  return c.json(result.rows[0], 201)
})

// PUT /notes/:id — actualizar nota
app.put(
  '/notes/:id',
  zValidator('param', idParamSchema, onValidationError),
  zValidator('json', updateNoteSchema, onValidationError),
  async (c) => {
    const db = getDb(c.env)
    const { id } = c.req.valid('param')
    const { name, content } = c.req.valid('json')
    const result = await db.execute(
      content !== undefined
        ? {
            sql: `UPDATE notes SET name = ?, content = ?, updated_at = datetime('now') WHERE id = ? RETURNING ${NOTE_SELECT}`,
            args: [name, content, id],
          }
        : {
            sql: `UPDATE notes SET name = ?, updated_at = datetime('now') WHERE id = ? RETURNING ${NOTE_SELECT}`,
            args: [name, id],
          }
    )
    if (result.rows.length === 0) throw new HTTPException(404, { message: 'Not found' })
    return c.json(result.rows[0])
  }
)

// DELETE /notes/:id — eliminar nota
app.delete('/notes/:id', zValidator('param', idParamSchema, onValidationError), async (c) => {
  const db = getDb(c.env)
  const { id } = c.req.valid('param')
  await db.execute({ sql: 'DELETE FROM notes WHERE id = ?', args: [id] })
  return c.json({ success: true })
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
