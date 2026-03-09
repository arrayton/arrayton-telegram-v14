import { Bot } from 'grammy';
import { config } from '@/config/config';
import { SubscriberAnalysisService, BotUsersService, NotificationService } from '@/services';
import {
  handleStart,
  openAppKeyboard,
  requireAdmin,
  handleUsersBot,
  handleChannels,
  handleChannelSubs,
} from '@/commands';

const bot = new Bot(config.BOT_TOKEN);

const DEFAULT_MENU = [{ command: 'start', description: 'Старт / открыть платформу' }];

const ADMIN_MENU = [
  ...DEFAULT_MENU,
  { command: 'users_bot', description: 'Список пользователей бота' },
  { command: 'channels', description: 'Список каналов' },
  { command: 'channel_subs', description: 'Подписчики канала: /channel_subs <id>' },
];

async function setupCommands(): Promise<void> {
  await bot.api.setMyCommands(DEFAULT_MENU);
  for (const adminId of config.ADMIN_TELEGRAM_IDS) {
    await bot.api.setMyCommands(ADMIN_MENU, {
      scope: { type: 'chat', chat_id: adminId },
    });
  }
}

const botInfo = await bot.api.getMe();
const botChannelId = BigInt(botInfo.id);
const botTitle = config.BOT_USERNAME ?? botInfo.username ?? 'ArrayTonBot';

await BotUsersService.initBotChannel({
  botId: botInfo.id,
  title: botTitle,
  username: botInfo.username,
});

await setupCommands();

const formatUserLabel = (user: { username?: string | null; first_name?: string | null; last_name?: string | null; id: number }) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—';
  const mention = user.username ? `@${user.username}` : `id: ${user.id}`;
  return `${name} (${mention})`;
};

bot.use(async (ctx, next) => {
  if (ctx.chat?.type === 'private' && ctx.from && ctx.message) {
    const userId = BigInt(ctx.from.id);
    const type = ctx.message.entities?.some((e) => e.type === 'bot_command') ? 'command' : 'message';
    const { isNewUser } = await BotUsersService.recordInteraction({
      userId,
      from: ctx.from,
      botChannelId,
      type,
    });
    if (isNewUser) {
      await NotificationService.sendToAdmins(
        bot,
        `🆕 <b>Новый пользователь в боте</b>\n${formatUserLabel(ctx.from)}`
      );
    }
  }
  return next();
});

bot.command('start', handleStart);
bot.command('users_bot', requireAdmin, handleUsersBot);
bot.command('channels', requireAdmin, handleChannels);
bot.command('channel_subs', requireAdmin, handleChannelSubs);
bot.on('message', async (ctx) => {
  if (ctx.chat?.type !== 'private') return;
  await ctx.reply('Нажми кнопку ниже, чтобы открыть платформу 👇', { reply_markup: openAppKeyboard });
});

bot.on('chat_member', async (ctx) => {
  const oldStatus = ctx.chatMember.old_chat_member.status;
  const newStatus = ctx.chatMember.new_chat_member.status;
  const chat = ctx.chatMember.chat;
  const user = ctx.chatMember.from;

  const chatData = {
    id: chat.id,
    title: chat.title ?? undefined,
    type: chat.type,
    username: 'username' in chat ? chat.username ?? undefined : undefined,
  };

  const result = await SubscriberAnalysisService.handleChatMemberUpdate({
    oldStatus,
    newStatus,
    chat: chatData,
    user,
  });
  if (result.joined && result.user && result.chat) {
    const channelLabel = result.chat.title ?? result.chat.username ?? String(result.chat.id);
    await NotificationService.sendToAdmins(
      bot,
      `📢 <b>Новая подписка на канал</b>\nПользователь: ${formatUserLabel(result.user)}\nКанал: ${channelLabel}`
    );
  }
});

bot.start({
  allowed_updates: ['chat_member', 'message'],
});
