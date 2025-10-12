import { createError, readBody } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const admin = event.context?.auth?.user
  if (!admin || (admin.role !== 'admin' && admin.role !== 'moderator')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const id = Number(event.context?.params?.id)
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody(event)
  const confirmed = Boolean(body?.confirmed)

  // Обновляем статус email в базе
  const updatedUser = await prisma.user.update({ 
    where: { id }, 
    data: { confirmedEmail: confirmed },
    select: {
      id: true,
      email: true,
      confirmedEmail: true
    }
  })

  // Логируем действие
  await prisma.auditLog.create({ 
    data: { 
      userId: admin.id, 
      action: 'admin.user.confirm_email', 
      targetType: 'User', 
      targetId: id, 
      result: 'success', 
      metadata: { 
        confirmed,
        userEmail: updatedUser.email
      } 
    } 
  })

  // Обновляем активные сессии пользователя, делаем их неактивными
  await prisma.session.updateMany({
    where: { 
      userId: id,
      isActive: true,
      expiresAt: { gt: new Date() }
    },
    data: { isActive: false }
  })

  return { success: true }
})
