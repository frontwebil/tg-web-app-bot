const webAppUrl = "https://tg-web-app-react-tawny.vercel.app";

export const form_markup = JSON.stringify({
  keyboard: [
    [
      {
        text: "Заповнити форму",
        web_app: {
          url: webAppUrl + "/form",
        },
      },
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
});
