import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const admin = event.context?.auth?.user
  if (!admin || (admin.role !== 'admin' && admin.role !== 'moderator')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  const key = event.context?.params?.key
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Missing key' })
  const body: any = await readBody(event)
  const value = body.value ?? body

  try {
    // @ts-ignore runtime guard
    if (!prisma.adminSetting || typeof prisma.adminSetting.findUnique !== 'function') {
      // DB model not available (migration not run) — return a helpful error
      throw createError({ statusCode: 500, statusMessage: 'AdminSetting model not available. Run prisma migrate.' })
    }

    const existing = await prisma.adminSetting.findUnique({ where: { key } })
    if (existing) {
      const updated = await prisma.adminSetting.update({ where: { key }, data: { value } })
      return { success: true, data: updated }
    } else {
      const created = await prisma.adminSetting.create({ data: { key, value } })
      return { success: true, data: created }
    }
  } catch (err: any) {
    // bubble known errors
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: String(err) })
  }
})
