import { Bot } from 'grammy';
import { config } from '@/config/config';
import { SubscriberAnalysisService, BotUsersService } from '@/services';
import { handleStart, openAppKeyboard } from '@/commands';

const bot = new Bot(config.BOT_TOKEN);

const botInfo = await bot.api.getMe();
const botChannelId = BigInt(botInfo.id);
const botTitle = config.BOT_USERNAME ?? botInfo.username ?? 'ArrayTonBot';

await BotUsersService.initBotChannel({
  botId: botInfo.id,
  title: botTitle,
  username: botInfo.username,
});

bot.use(async (ctx, next) => {
  if (ctx.chat?.type === 'private' && ctx.from && ctx.message) {
    const userId = BigInt(ctx.from.id);
    const type = ctx.message.entities?.some((e) => e.type === 'bot_command') ? 'command' : 'message';
    await BotUsersService.recordInteraction({
      userId,
      from: ctx.from,
      botChannelId,
      type,
    });
  }
  return next();
});

bot.command('start', handleStart);
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

  await SubscriberAnalysisService.handleChatMemberUpdate({
    oldStatus,
    newStatus,
    chat: chatData,
    user,
  });
});

bot.start({
  allowed_updates: ['chat_member', 'message'],
});
