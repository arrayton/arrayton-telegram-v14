import type { Context } from 'grammy';
import { prisma } from '@/utils/lib/prisma';

const PAGE_SIZE = 15;

export async function handleChannelSubs(ctx: Context): Promise<void> {
  if (ctx.chat?.type !== 'private') return;

  const parts = ctx.message?.text?.trim().split(/\s+/);
  const channelIdStr = parts?.[1];
  const rawPage = parts?.[2];
  const channelId = channelIdStr ? BigInt(channelIdStr) : null;
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  if (channelId === null) {
    await ctx.reply(
      'Использование: <code>/channel_subs &lt;id_канала&gt; [страница]</code>\n\nID канала можно взять из списка /channels.',
      { parse_mode: 'HTML' }
    );
    return;
  }

  const [channel, subs, total] = await Promise.all([
    prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true, title: true, username: true },
    }),
    prisma.channelSubscriber.findMany({
      where: { channelId, leftAt: null },
      orderBy: { joinedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: { user: { select: { telegramId: true, username: true, firstName: true, lastName: true } } },
    }),
    prisma.channelSubscriber.count({ where: { channelId, leftAt: null } }),
  ]);

  if (!channel) {
    await ctx.reply('Канал с таким ID не найден.');
    return;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const channelLabel = channel.title ?? channel.username ?? String(channel.id);

  const lines = subs.map((s, i) => {
    const u = s.user;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
    const mention = u.username ? `@${u.username}` : String(u.telegramId);
    return `${skip + i + 1}. ${name} (${mention}) — id: ${u.telegramId}`;
  });

  const header = `📋 <b>Подписчики:</b> ${channelLabel}\nВсего: ${total}, стр. ${currentPage}/${totalPages}\n\n`;
  const body = lines.length ? lines.join('\n') : 'Нет подписчиков.';
  const footer =
    totalPages > 1
      ? `\n\n<code>/channel_subs ${channelId} ${currentPage < totalPages ? currentPage + 1 : 1}</code> — след. стр.`
      : '';

  await ctx.reply(header + body + footer, { parse_mode: 'HTML' });
}
