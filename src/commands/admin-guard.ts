import type { Context } from 'grammy';
import { config } from '@/config/config';

const ADMIN_IDS = new Set(config.ADMIN_TELEGRAM_IDS);

export function isAdmin(ctx: Context): boolean {
  const id = ctx.from?.id;
  return id !== undefined && ADMIN_IDS.has(id);
}

export async function requireAdmin(ctx: Context, next: () => Promise<void>): Promise<void> {
  if (!isAdmin(ctx)) {
    await ctx.reply('⛔ Команда доступна только администраторам.');
    return;
  }
  await next();
}
