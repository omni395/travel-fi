import { defineEventHandler } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {

  // Some dev environments may not have Prisma client regenerated yet.
  // Guard against prisma.adminSetting being undefined and return sensible defaults.
  try {
    // @ts-ignore - runtime guard
    if (!prisma.adminSetting || typeof prisma.adminSetting.findMany !== 'function') {
      return { success: true, data: {} }
    }

    const settings = await prisma.adminSetting.findMany()
    const result: any = {}
    for (const s of settings) result[s.key] = s.value
    return { success: true, data: result }
  } catch (err) {
    // If DB/table missing, return empty object so UI can show defaults
    return { success: true, data: {} }
  }
})
