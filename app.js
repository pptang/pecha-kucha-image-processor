const fs = require('fs');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const drawPreferenceChart = ({
  alcohol,
  sports,
  place,
  drink,
  ball,
  food,
  entertainment,
}) => {
  const canvas = createCanvas(1280, 400);
  const ctx = canvas.getContext('2d');
  // Fill the background color for the whole image
  ctx.fillStyle = '#434343';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;

  const drawLeftBar = (x, y, width, height, emoji) => {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.font = '20px serif';
    ctx.fillText(emoji, x + 5, y + 25);
  };

  const drawRightBar = (x, y, width, height, emoji) => {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.font = '20px serif';
    ctx.fillText(emoji, x + width - 25, y + 25);
  };

  const BAR_HEIGHT = 40;
  const startingY = 20;
  const leftRightBarMargin = 1;
  let step = 50;

  const { basketball, tableTennis } = ball;
  const ballLeftWidth =
    (canvas.width / 2) * (basketball / (basketball + tableTennis));
  const ballRightWidth =
    (canvas.width / 2) * (tableTennis / (basketball + tableTennis));

  drawLeftBar(
    centerX - ballLeftWidth,
    startingY,
    ballLeftWidth,
    BAR_HEIGHT,
    '🏀'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY,
    ballRightWidth,
    BAR_HEIGHT,
    '🏓'
  );

  const { wine, whisky } = alcohol;
  const alcoholLeftWidth = (canvas.width / 2) * (wine / (wine + whisky));
  const alcoholRightWidth = (canvas.width / 2) * (whisky / (wine + whisky));
  drawLeftBar(
    centerX - alcoholLeftWidth,
    startingY + step,
    alcoholLeftWidth,
    BAR_HEIGHT,
    '🍷'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY + step,
    alcoholRightWidth,
    BAR_HEIGHT,
    '🥃'
  );

  step += 50;

  const { running, gym } = sports;
  const sportsLeftWidth = (canvas.width / 2) * (running / (running + gym));
  const sportsRightWidth = (canvas.width / 2) * (gym / (running + gym));
  drawLeftBar(
    centerX - sportsLeftWidth,
    startingY + step,
    sportsLeftWidth,
    BAR_HEIGHT,
    '🏃‍♀️'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY + step,
    sportsRightWidth,
    BAR_HEIGHT,
    '🏋️‍♂️'
  );

  step += 50;

  const { mountain, sea } = place;
  const placeLeftWidth = (canvas.width / 2) * (mountain / (mountain + sea));
  const placeRightWidth = (canvas.width / 2) * (gym / (mountain + sea));
  drawLeftBar(
    centerX - placeLeftWidth,
    startingY + step,
    placeLeftWidth,
    BAR_HEIGHT,
    '🏔'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY + step,
    placeRightWidth,
    BAR_HEIGHT,
    '🌊'
  );

  step += 50;

  const { burrito, burger } = food;
  const foodLeftWidth = (canvas.width / 2) * (burrito / (burrito + burger));
  const foodRightWidth = (canvas.width / 2) * (burger / (burrito + burger));
  drawLeftBar(
    centerX - foodLeftWidth,
    startingY + step,
    foodLeftWidth,
    BAR_HEIGHT,
    '🌯'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY + step,
    foodRightWidth,
    BAR_HEIGHT,
    '🍔'
  );

  step += 50;

  const { music, tv } = entertainment;
  const entertainmentLeftWidth = (canvas.width / 2) * (music / (music + tv));
  const entertainmentRightWidth = (canvas.width / 2) * (tv / (music + tv));
  drawLeftBar(
    centerX - entertainmentLeftWidth,
    startingY + step,
    entertainmentLeftWidth,
    BAR_HEIGHT,
    '📺'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY + step,
    entertainmentRightWidth,
    BAR_HEIGHT,
    '🎤'
  );

  step += 50;

  const { coffee, tea } = drink;
  const drinkLeftWidth = (canvas.width / 2) * (coffee / (coffee + tea));
  const drinkRightWidth = (canvas.width / 2) * (tea / (coffee + tea));
  drawLeftBar(
    centerX - drinkLeftWidth,
    startingY + step,
    drinkLeftWidth,
    BAR_HEIGHT,
    '☕️'
  );
  drawRightBar(
    centerX + leftRightBarMargin,
    startingY + step,
    drinkRightWidth,
    BAR_HEIGHT,
    '🍵'
  );

  // Draw the center vertical line
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.fillStyle = 'black';
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  const imgName = `image-${getRandomInt(100)}`;
  fs.writeFileSync(`./public/${imgName}.png`, buffer);
  return `https://pecha-kucha-mashi-mashi.herokuapp.com/${imgName}.png`;
};

app.post('/generate-preference-chart', async (req, res) => {
  // 1. Get vote result
  const { place, entertainment, sports, ball, drink, food, alcohol } = req.body;

  // 2. Retrieve current preference in DB

  const preferenceRef = db.collection('preference').doc('options');
  // 3. Update DB
  await preferenceRef.update({
    [`place.${place}`]: admin.firestore.FieldValue.increment(1),
    [`entertainment.${entertainment}`]: admin.firestore.FieldValue.increment(1),
    [`sports.${sports}`]: admin.firestore.FieldValue.increment(1),
    [`ball.${ball}`]: admin.firestore.FieldValue.increment(1),
    [`drink.${drink}`]: admin.firestore.FieldValue.increment(1),
    [`food.${food}`]: admin.firestore.FieldValue.increment(1),
    [`alcohol.${alcohol}`]: admin.firestore.FieldValue.increment(1),
  });
  const doc = await preferenceRef.get();
  const updatedResult = doc.data();

  // 4. Generate preference chart
  const imgUrl = drawPreferenceChart(updatedResult);
  // 5. Return the preference chart url
  res.json({
    imgUrl,
  });
});

// app.post('/generate-ikigai', async (req, res) => {
//   const width = 1000;
//   const height = 1000;
//   const canvas = createCanvas(width, height);
//   const ctx = canvas.getContext('2d');
//   const img = await loadImage('./ikigai.png');
//   ctx.drawImage(img, 15, 30);
//   ctx.font = '16px serif';
//   const data = req.body;
//   ctx.fillText(data.love, 397, 207);
//   ctx.fillText(data.happy, 402, 429);
//   ctx.fillText(data.skill, 621, 418);
//   ctx.fillText(data.help, 479, 330);
//   ctx.fillText(data.inspire, 302, 323);
//   ctx.fillText(data.angry, 470, 503);
//   ctx.fillText(data.sell, 380, 596);
//   ctx.fillText(data.job, 308, 495);
//   const buffer = canvas.toBuffer('image/png');
//   const imgName = `image-${getRandomInt(100)}`;
//   fs.writeFileSync(`./public/${imgName}.png`, buffer);
//   res.json({
//     imgUrl: `https://pecha-kucha-mashi-mashi.herokuapp.com/${imgName}.png`,
//   });
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
