import { createError, readBody } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const admin = event.context?.auth?.user
  if (!admin || (admin.role !== 'admin' && admin.role !== 'moderator')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const id = Number(event.context?.params?.id)
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const wifiPoint = await prisma.wifiPoint.findUnique({ where: { id }, include: { user: true } })
  if (!wifiPoint) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (wifiPoint.status === 'rejected') return { success: true, message: 'Already rejected' }

  await prisma.wifiPoint.update({ where: { id }, data: { status: 'rejected' } })

  await prisma.auditLog.create({ data: { userId: admin.id, action: 'admin.wifi.reject', targetType: 'WifiPoint', targetId: id, result: 'success', metadata: {} } })

  return { success: true }
})
