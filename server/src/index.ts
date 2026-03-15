import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign } from 'hono/jwt'
import { createClient } from '@libsql/client/http'
import bcrypt from 'bcryptjs'

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

function getDb(env: Bindings) {
  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })
}

// POST /auth — verifica la password y devuelve un JWT (expira en 1h)
app.post('/auth', async (c) => {
  const { password } = await c.req.json<{ password: string }>()
  const valid = await bcrypt.compare(password, c.env.MASTER_PASSWORD_HASH)
  if (!valid) return c.json({ error: 'Unauthorized' }, 401)

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
  const result = await db.execute('SELECT id, name, created_at, updated_at FROM notes ORDER BY updated_at DESC')
  return c.json(result.rows)
})

// GET /notes/:id — nota completa con markdown
app.get('/notes/:id', async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const result = await db.execute({ sql: 'SELECT * FROM notes WHERE id = ?', args: [id] })
  if (result.rows.length === 0) return c.json({ error: 'Not found' }, 404)
  return c.json(result.rows[0])
})

// POST /notes — crear nota
app.post('/notes', async (c) => {
  const db = getDb(c.env)
  const { name, content } = await c.req.json<{ name: string; content: string }>()
  const result = await db.execute({
    sql: 'INSERT INTO notes (name, content) VALUES (?, ?) RETURNING *',
    args: [name, content],
  })
  return c.json(result.rows[0], 201)
})

// PUT /notes/:id — actualizar nota
app.put('/notes/:id', async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  const { name, content } = await c.req.json<{ name: string; content: string }>()
  const result = await db.execute({
    sql: `UPDATE notes SET name = ?, content = ?, updated_at = datetime('now') WHERE id = ? RETURNING *`,
    args: [name, content, id],
  })
  if (result.rows.length === 0) return c.json({ error: 'Not found' }, 404)
  return c.json(result.rows[0])
})

// DELETE /notes/:id — eliminar nota
app.delete('/notes/:id', async (c) => {
  const db = getDb(c.env)
  const id = c.req.param('id')
  await db.execute({ sql: 'DELETE FROM notes WHERE id = ?', args: [id] })
  return c.json({ success: true })
})

export default app
