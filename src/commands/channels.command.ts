import type { Context } from 'grammy';
import { prisma } from '@/utils/lib/prisma';

const PAGE_SIZE = 15;

export async function handleChannels(ctx: Context): Promise<void> {
  if (ctx.chat?.type !== 'private') return;

  const rawPage = ctx.message?.text?.split(/\s+/)[1];
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [channels, activeCounts, total] = await Promise.all([
    prisma.channel.findMany({
      orderBy: { updatedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      select: { id: true, title: true, username: true, type: true },
    }),
    prisma.channelSubscriber.groupBy({
      by: ['channelId'],
      where: { leftAt: null },
      _count: true,
    }),
    prisma.channel.count(),
  ]);

  const countByChannel = new Map(activeCounts.map((c) => [c.channelId.toString(), c._count]));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const lines = channels.map((ch, i) => {
    const label = ch.title ?? ch.username ?? String(ch.id);
    const subs = countByChannel.get(ch.id.toString()) ?? 0;
    return `${skip + i + 1}. ${label} (${ch.type ?? '?'}) — подписчиков: ${subs}\n   <code>/channel_subs ${ch.id}</code>`;
  });

  const header = `📢 <b>Каналы</b> (всего: ${total})\nСтр. ${currentPage}/${totalPages}\n\n`;
  const body = lines.length ? lines.join('\n') : 'Нет данных.';
  const footer =
    totalPages > 1
      ? `\n\n<code>/channels ${currentPage < totalPages ? currentPage + 1 : 1}</code> — след. стр.`
      : '';

  await ctx.reply(header + body + footer, { parse_mode: 'HTML' });
}
