import { prisma } from '@/utils/lib/prisma';

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface InitBotChannelParams {
  botId: number;
  title: string;
  username?: string;
}

interface RecordInteractionParams {
  userId: bigint;
  from: TelegramUser;
  botChannelId: bigint;
  type: 'command' | 'message';
}

/**
 * Сервис учёта обращений пользователей к боту.
 * Сохраняет User, создаёт BotInteraction при каждом сообщении в личку.
 */
export const BotUsersService = {
  async initBotChannel(params: InitBotChannelParams): Promise<void> {
    const botChannelId = BigInt(params.botId);
    await prisma.channel.upsert({
      where: { id: botChannelId },
      create: {
        id: botChannelId,
        title: params.title,
        username: params.username ?? null,
        type: 'bot',
      },
      update: {
        title: params.title,
        username: params.username ?? null,
        type: 'bot',
      },
    });
  },

  async recordInteraction(params: RecordInteractionParams): Promise<void> {
    const { userId, from, botChannelId, type } = params;

    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          telegramId: userId,
          username: from.username ?? null,
          firstName: from.first_name ?? null,
          lastName: from.last_name ?? null,
        },
        update: {
          telegramId: userId,
          username: from.username ?? undefined,
          firstName: from.first_name ?? undefined,
          lastName: from.last_name ?? undefined,
        },
      });
      await tx.botInteraction.create({
        data: { channelId: botChannelId, userId, type },
      });
    });
  },
};
