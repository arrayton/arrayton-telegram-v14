import { Context, InlineKeyboard } from 'grammy';

type LanguageCode = 'ru' | 'en';

const welcomeCopy: Record<LanguageCode, { greetingWithName: (name: string) => string; defaultGreeting: string; body: string }> = {
  ru: {
    greetingWithName: (name: string) => `Привет, ${name}! 👋`,
    defaultGreeting: 'Привет! 👋',
    body: `Добро пожаловать в ArrayTON — единую платформу для исследования экосистемы TON.

🎯 Что здесь найдёшь:

• Каталог проектов и токенов — всё в одном месте
• Цены токенов в TON, долларах и рублях
• Анализ держателей: кто и сколько держит
• Отслеживание кошельков и транзакций
• Личный кабинет — подключи кошелёк и смотри свой портфель
• Поиск по проектам, токенам, организациям

Открыть платформу: arrayton.com`,
  },
  en: {
    greetingWithName: (name: string) => `Hello, ${name}! 👋`,
    defaultGreeting: 'Hello! 👋',
    body: `Welcome to ArrayTON — the unified platform for researching the TON ecosystem.

🎯 What you can find here:

• Catalog of projects and tokens — everything in one place
• Token prices in TON, USD, and RUB
• Holder analysis: who holds how much
• Wallet and transaction tracking
• Personal dashboard — connect your wallet and monitor your portfolio
• Search across projects, tokens, and organizations

Open the platform: arrayton.com`,
  },
};

const resolveLanguage = (languageCode?: string): LanguageCode => {
  if (!languageCode) return 'ru';
  return languageCode.toLowerCase().startsWith('en') ? 'en' : 'ru';
};

const getWelcomeMessage = (firstName: string | undefined, language: LanguageCode) => {
  const copy = welcomeCopy[language];
  const greeting = firstName ? copy.greetingWithName(firstName) : copy.defaultGreeting;
  return `${greeting}\n\n${copy.body}`;
};

const openAppButtonLabel: Record<LanguageCode, string> = {
  ru: '💎 Открыть ArrayTON',
  en: '💎 Open ArrayTON',
};

export const getOpenAppKeyboard = (language: LanguageCode) =>
  new InlineKeyboard().webApp(openAppButtonLabel[language], 'https://arrayton.com');

export const handleStart = async (ctx: Context): Promise<void> => {
  if (ctx.chat?.type !== 'private') return;
  const language = resolveLanguage(ctx.from?.language_code);
  await ctx.reply(getWelcomeMessage(ctx.from?.first_name, language), { reply_markup: getOpenAppKeyboard(language) });
};
