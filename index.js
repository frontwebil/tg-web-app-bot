import "dotenv/config";
import { Bot, Api } from "node-telegram-bot-api";
import { form_markup } from "./markups.js";
import express from "express";
import cors from "cors";

const token = process.env.BOT_TOKEN;

const bot = new Bot(token);
const api = new Api(token);

const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chat_id = msg.update.message.chat.id;
  const text = msg.update.message.text;

  if (text === "/start") {
    await api.sendMessage({
      chat_id,
      text: "Заповніть форму по кнопкі",
      reply_markup: form_markup,
    });
  }

  if (msg.update.message.web_app_data) {
    try {
      const data = JSON.parse(msg.update.message.web_app_data.data);
      console.log(data);

      await api.sendMessage({
        chat_id,
        text: "Дякую за зворотній відгук",
      });
    } catch (error) {
      console.log(error);
    }
  }
});

bot.startPolling();

app.post("/web-data", async (req, res) => {
  const { chatId, queryId, totalPrice } = req.body;

  const orderNumber = Math.floor(10000 + Math.random() * 90000);

  try {
    const messageText =
      `<b>Вітаємо. Ви успішно оформили замовлення!</b>\n\n` +
      `<b>Номер вашого замовлення:</b> ${orderNumber}\n` +
      `<b>Сумма замовлення:</b> ${totalPrice} грн.\n\n` +
      `Очікуйте на дзвінок нашого менеджера!\n\n` +
      `Якщо виникли питання по замовленню або потрібна консультація нашого менеджера, <a href="https://t.me/your_manager_username">напишіть нам</a>`;

    if (chatId) {
      await api.sendMessage({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }

    if (queryId) {
      await fetch(`https://api.telegram.org/bot${token}/answerWebAppQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          web_app_query_id: queryId,
          result: {
            type: "article",
            id: queryId,
            title: "Замовлення оформлено",
            input_message_content: {
              message_text: "Замовлення успішно прийнято!",
            },
          },
        }),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("TELEGRAM ERROR:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log("server is started on PORT " + PORT));
