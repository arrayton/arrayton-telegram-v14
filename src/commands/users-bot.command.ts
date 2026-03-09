import type { Context } from 'grammy';
import { prisma } from '@/utils/lib/prisma';

const PAGE_SIZE = 15;

export async function handleUsersBot(ctx: Context): Promise<void> {
  if (ctx.chat?.type !== 'private') return;

  const rawPage = ctx.message?.text?.split(/\s+/)[1];
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { botInteractions: { some: {} } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: { botInteractions: { some: {} } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const lines = users.map((u, i) => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
    const mention = u.username ? `@${u.username}` : String(u.telegramId);
    return `${skip + i + 1}. ${name} (${mention}) — id: ${u.telegramId}`;
  });

  const header = `👤 <b>Пользователи бота</b> (всего: ${total})\nСтр. ${currentPage}/${totalPages}\n\n`;
  const body = lines.length ? lines.join('\n') : 'Нет данных.';
  const footer =
    totalPages > 1
      ? `\n\n<code>/users_bot ${currentPage < totalPages ? currentPage + 1 : 1}</code> — след. стр.`
      : '';

  await ctx.reply(header + body + footer, { parse_mode: 'HTML' });
}
