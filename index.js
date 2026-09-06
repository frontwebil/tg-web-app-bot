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
  console.log("WEB DATA:", req.body);

  const { queryId, products, totalPrice } = req.body;

  try {
    const result = await api.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успішна покупка",
      description: `Сума: ${totalPrice} грн`,
      input_message_content: {
        message_text: `Покупка успішна!\n\nТоварів: ${products.length}\nСума: ${totalPrice} грн`,
      },
    });

    console.log("TELEGRAM RESULT:", result);

    res.json({ success: true });
  } catch (error) {
    console.error("TELEGRAM ERROR:", error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log("server is started on PORT " + PORT));
