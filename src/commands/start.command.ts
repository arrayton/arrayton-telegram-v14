import { Context, InlineKeyboard } from 'grammy';

const getWelcomeMessage = (firstName?: string) => {
  const greeting = firstName ? `Привет, ${firstName}! 👋` : 'Привет! 👋';
  return `${greeting}

Добро пожаловать в ArrayTON — единую платформу для исследования экосистемы TON.

🎯 Что здесь найдёшь:

• Каталог проектов и токенов — всё в одном месте
• Цены токенов в TON, долларах и рублях
• Анализ держателей: кто и сколько держит
• Отслеживание кошельков и транзакций
• Личный кабинет — подключи кошелёк и смотри свой портфель
• Поиск по проектам, токенам, организациям

Открыть платформу: arrayton.com`;
};

export const openAppKeyboard = new InlineKeyboard().webApp('💎 Открыть ArrayTON', 'https://arrayton.com');

export const handleStart = async (ctx: Context): Promise<void> => {
  if (ctx.chat?.type !== 'private') return;
  await ctx.reply(getWelcomeMessage(ctx.from?.first_name), { reply_markup: openAppKeyboard });
};
