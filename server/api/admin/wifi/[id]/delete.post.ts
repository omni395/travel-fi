import { createError } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {

  const id = Number(event.context?.params?.id)
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  // Soft delete: set status to 'deleted' or hard delete depending on project policy
  try {
    await prisma.wifiPoint.update({ where: { id }, data: { status: 'deleted' } })
    await prisma.auditLog.create({ data: { action: 'admin.wifi.delete', targetType: 'WifiPoint', targetId: id, result: 'success', metadata: {} } })
    return { success: true }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err) })
  }
})
