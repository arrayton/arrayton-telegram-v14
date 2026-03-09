import type { Bot } from 'grammy';
import { config } from '@/config/config';

/**
 * Отправка уведомлений всем админам из ADMIN_TELEGRAM_IDS.
 */
export const NotificationService = {
  async sendToAdmins(bot: Bot, message: string): Promise<void> {
    if (config.ADMIN_TELEGRAM_IDS.length === 0) return;
    await Promise.allSettled(
      config.ADMIN_TELEGRAM_IDS.map((chatId) =>
        bot.api.sendMessage(chatId, message, { parse_mode: 'HTML' })
      )
    );
  },
};
