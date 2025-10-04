import prisma from '~~/lib/prisma'
import { z } from 'zod'

const schema = z.object({ value: z.string() })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { value } = schema.parse(body)
  if (!value) return { userId: null }
  const user = await prisma.user.findFirst({ where: { email: value } })
  return { userId: user ? user.id : null }
})
