const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
require('dotenv').config();
const axios = require('axios');

const gurbageCalendarUrl = process.env.GURBAGE_CALENDAR_URL;

const getGurbageKind = async (selector) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(gurbageCalendarUrl);

  const date = await page.$(selector);
  const text = await (await date.getProperty('textContent')).jsonValue();

  await browser.close();
  return text;
};

const pushMessage = async (message) => {
  try {
    const token = process.env.LINE_NOTIFY_TOKEN;
    await axios({
      method: 'post',
      url: 'https://notify-api.line.me/api/notify',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: { message }
    });
    return '通知に成功しました';
  } catch (error) {
    return `通知に失敗しました。\n${error}`;
  }
};

exports.gurbageNotify = functions.https.onRequest(async (request, response) => {
  const todaySelector = '.today > div > a';
  const todayGurbageKind = await getGurbageKind(todaySelector);

  const message = `\n今日のゴミは「${todayGurbageKind}」です！`;
  const res = await pushMessage(message);
  response.send(res);
});
