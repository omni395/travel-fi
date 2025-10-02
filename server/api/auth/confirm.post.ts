import prisma from '~~/lib/prisma'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ token: string }>(event)
    if (!body?.token) {
      throw createError({ statusCode: 400, statusMessage: 'Token is required' })
    }

    const user = await prisma.user.findUnique({
      where: { confirmationToken: body.token } as any
    })

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid or expired token' })
    }

    if ((user as any).confirmedEmail) {
      throw createError({ statusCode: 409, statusMessage: 'Email already confirmed' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        confirmedEmail: true,
        confirmationToken: null
      } as any
    })

    return { ok: true, message: 'Email confirmed successfully' }
  } catch (error) {
    if (error instanceof createError) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})