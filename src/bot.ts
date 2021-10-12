import TelegramBot from 'node-telegram-bot-api'
import { getStat, addCigarette } from './nekuromba'

const bot = new TelegramBot(process.env.TELEGRAM_API_KEY)

bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
  bot.sendMessage(msg.chat.id, await generateMessage(msg.from!.id), {
    reply_markup: generateReplyMarkup(),
    parse_mode: 'HTML'
  })
})

bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
  if (query.data === 'smoked') {
    await addCigarette(query.from.id)
    bot.editMessageText(await generateMessage(query.from.id), {
      message_id: query.message?.message_id,
      chat_id: query.message?.chat.id,
      reply_markup: generateReplyMarkup(),
      parse_mode: 'HTML'
    })
  } else if (query.data === 'refresh') {
    bot.editMessageText(await generateMessage(query.from.id), {
      message_id: query.message?.message_id,
      chat_id: query.message?.chat.id,
      reply_markup: generateReplyMarkup(),
      parse_mode: 'HTML'
    })
  }
})

async function generateMessage(user_id: number): Promise<string> {
  const stat = await getStat(user_id, new Date())
  return `Всего выкурено сигарет: <b>${stat.total}</b>\n` +
    `В среднем в день:\n` +
    `— <b>${stat.averageAllTime}</b> за всё время\n` +
    `— <b>${stat.averageMonth}</b> за месяц\n` +
    `— <b>${stat.averageWeek}</b> за неделю\n` +
    `Сегодня (c 6-ти утра): <b>${stat.today}</b>\n` +
    `Последняя <b>${stat.formattedLast}</b>`
}

function generateReplyMarkup() {
  return {
    inline_keyboard: [
      [{ text: '🔃 Обновить', callback_data: 'refresh' }],
      [{ text: '🚬 Я курнул', callback_data: 'smoked' }]
    ]
  }
}

export default bot
