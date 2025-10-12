import { createError } from 'h3';
import prisma from '~/lib/prisma';
import { writeAudit } from '~/services/audit';

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    // Удаляем пользователя и связанные данные (можно расширить при необходимости)
    await prisma.user.delete({ where: { id: user.id } });
    await writeAudit({
      userId: user.id,
      action: 'DELETE_ACCOUNT',
      targetType: 'User',
      targetId: user.id,
      result: 'success',
      metadata: {},
      ipAddress: event.node.req.headers['x-forwarded-for']?.toString() || event.node.req.socket.remoteAddress,
      userAgent: event.node.req.headers['user-agent'],
    });
    // Удаляем сессию
    event.node.res.setHeader('Set-Cookie', 'auth-token=; Path=/; Max-Age=0; HttpOnly;');
    return { success: true };
  } catch (error: any) {
    await writeAudit({
      userId: user.id,
      action: 'DELETE_ACCOUNT',
      targetType: 'User',
      targetId: user.id,
  result: 'failure',
      metadata: { error: String(error) },
      ipAddress: event.node.req.headers['x-forwarded-for']?.toString() || event.node.req.socket.remoteAddress,
      userAgent: event.node.req.headers['user-agent'],
    });
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete account', data: { error: String(error) } });
  }
});
