import { z } from 'zod'

export const authSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export const createNoteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
  content: z.string().default(''),
})

export const updateNoteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is too long'),
  content: z.string().optional(),
})

export const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'ids cannot be empty'),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid id'),
})
