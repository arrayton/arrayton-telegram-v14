import { prisma } from '@/utils/lib/prisma';

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramChat {
  id: number;
  title?: string;
  type: string;
  username?: string;
}

interface HandleChatMemberParams {
  oldStatus: string;
  newStatus: string;
  chat: TelegramChat;
  user: TelegramUser;
}

/**
 * Сервис анализа подписчиков каналов.
 * Обрабатывает события join/leave, сохраняет User, Channel, ChannelSubscriber.
 */
export const SubscriberAnalysisService = {
  async handleChatMemberUpdate(params: HandleChatMemberParams): Promise<void> {
    const { oldStatus, newStatus, chat, user } = params;
    const chatId = BigInt(chat.id);
    const userId = BigInt(user.id);

    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          telegramId: userId,
          username: user.username ?? null,
          firstName: user.first_name ?? null,
          lastName: user.last_name ?? null,
        },
        update: {
          telegramId: userId,
          username: user.username ?? undefined,
          firstName: user.first_name ?? undefined,
          lastName: user.last_name ?? undefined,
        },
      });

      await tx.channel.upsert({
        where: { id: chatId },
        create: {
          id: chatId,
          title: chat.title ?? null,
          username: chat.username ?? null,
          type: chat.type,
        },
        update: {
          title: chat.title ?? undefined,
          username: chat.username ?? undefined,
          type: chat.type ?? undefined,
        },
      });

      const joined =
        (oldStatus === 'left' || oldStatus === 'kicked') &&
        (newStatus === 'member' || newStatus === 'restricted');
      const left =
        (oldStatus === 'member' || oldStatus === 'restricted') &&
        (newStatus === 'left' || newStatus === 'kicked');

      if (joined) {
        await tx.channelSubscriber.upsert({
          where: { channelId_userId: { channelId: chatId, userId } },
          create: { channelId: chatId, userId, subscribeCount: 1 },
          update: {
            joinedAt: new Date(),
            leftAt: null,
            subscribeCount: { increment: 1 },
          },
        });
        console.log('➕ Подписался:', user.id, 'в канал', chat.id);
      }

      if (left) {
        await tx.channelSubscriber.updateMany({
          where: { channelId: chatId, userId },
          data: { leftAt: new Date(), unsubscribeCount: { increment: 1 } },
        });
        console.log('➖ Отписался:', user.id, 'из канала', chat.id);
      }
    });
  },
};
