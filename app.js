const fs = require('fs');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID || 'pecha-kucha-b5a45',
    privateKey:
      process.env.FIREBASE_PRIVATE_KEY ||
      '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRum9YZv5vfy4Q\nHGzosM2492q5pkjkvF8KFofFqazgsyVOlmP3hVC9giGEHku/g0Fd04RwEhjez5nw\nJwAwG+lPkRqYMMdFgKHWHDRXycOh3zHREkjA8h3QMvh5aF/wpGnPqDIuxo+yreEj\nPI01rK4YagxUaFMKfENVbYJewOVTaaTF06QPvpbyklxvYjKwTjQQHHS/ws1SejSL\nEdCEqj3+5v90pxbplm1oJSHL5PPrWigqB6X2EDH/5h17o/dejIbsERRtCQTZGSzI\n/HxMdOKA58se2Rn7HOOWMEDQ9H9yFzdubCCLEzTq6Wcktw3Jh6Whzd0jpiJ/ey7t\nFbLpujt9AgMBAAECggEAJF9CnbB4+lGyZaFkYuN8vhIMnIdB14dyrQ90uvs+69Yt\nx2gODLh+ZOtLUDwn014aSUEcVApTbVrQHeXJos5IY1/tHo1BFeTlzDnmev4XEzzf\nyRw0aV/j+z5HuNh44QVGg3iuQU320FxW8fM3oyIgLERCAKZ6FlSwIcHk7PVjoBgf\nCUblqHgBgjnq2i7NV3g3GxNv+GrkNVLRVSsDJwJmaNF8ajSaKgTnyG415Mm7aUbn\nb5w6Z991g9n5HX8gosHnLbclus2mLsQ8CZvPexZQugMJAU1e9FKLdyk3HQjm+s4t\nOcOlkTKHtccwn0BX3UBQuwSha65T5EZmagOH2/6f6QKBgQDwuteqnEEzDf+eWcok\npCUX5tnV9FB5S2tYOBFKk+a5UQBFYYRxxiURxq6RiH46SoQwkxlOgqyaigPe6Lp0\nIseDVMk5+5cn4sY9MC5ooBdvnJGtcQ18OpViT1TM+6kS11nVynvO8neDoFLwreUW\nybZsRU0VpPy+v6NZ58A7vSbBRQKBgQDfCConw1sE9gZzgXlSEaTTcp/8b2I1qR81\nm+MPe00HKRM5F+1IkYgwtaw6/9rrxBy84BQ7X15P9RCSLtVZ0JViHAR1KQoBk5ks\n2pso5g8JTeCHrfp1wEUzHVG65sRh5TSiDd8AcNLD7bI4T55GlcVpJjwsUjvGoGkB\nTIhpX0FI2QKBgHAjiY2HZnPjBH1+dETnVgQxXK5nNgma0XFyBNQJ28Pd8NNhHvJl\nDCWguPdAbxS2W6fJDlPdWYxP2IfBQAITpX8PQwHIqlxBLnmYdTX1xZUPiWkTLeX9\n4FLAg89NODB3svh9b3kyx+vABoLpbrtT0a/UBJmdlsNAwFaEN69caK5FAoGALqZ6\nis6l3yfGuao/QhdGrqOvKxHxLOAvEvuERty3g+PnjW2fyCoInoehesXBeMcQa8FC\n+hg8leTgjnMVVS/3zwmlNQxcd2/z/hnLkoZsZrnPWRHe7XpF/ycGzV0vfnp+w9a6\n6lCvBSRWvsiIhqMVI6VHuM2Ki0VKMWdcsQ2njiECgYEAmDl60WbU4FPNeee6FphH\n39biFZQheIq2zE/dtRsgdaBdDmLst9Agb8GzjRCULyPtdVE3MDHrlHWQ30MdA7kp\nQG++pLAEtoxnSYoj+nVCZCiE0C5mFv+rOko/2X5sElkOIFUZ7OFxwttB7d3G6kEP\n0uXJffoT/RZGVJ84auO5lok=\n-----END PRIVATE KEY-----\n',
    clientEmail:
      process.env.FIREBASE_CLIENT_EMAIL ||
      'firebase-adminsdk-fvuxc@pecha-kucha-b5a45.iam.gserviceaccount.com',
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

const drawPreferenceChart = async ({
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

  const drawLeftBar = async (x, y, width, height, emoji) => {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.font = '20px serif';
    await fillTextWithTwemoji(ctx, emoji, x + 5, y + 25);
  };

  const drawRightBar = async (x, y, width, height, emoji) => {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.font = '20px serif';
    await fillTextWithTwemoji(ctx, emoji, x + width - 25, y + 25);
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

  await drawLeftBar(
    centerX - ballLeftWidth,
    startingY,
    ballLeftWidth,
    BAR_HEIGHT,
    '🏀'
  );
  await drawRightBar(
    centerX + leftRightBarMargin,
    startingY,
    ballRightWidth,
    BAR_HEIGHT,
    '🏓'
  );

  const { wine, whisky } = alcohol;
  const alcoholLeftWidth = (canvas.width / 2) * (wine / (wine + whisky));
  const alcoholRightWidth = (canvas.width / 2) * (whisky / (wine + whisky));
  await drawLeftBar(
    centerX - alcoholLeftWidth,
    startingY + step,
    alcoholLeftWidth,
    BAR_HEIGHT,
    '🍷'
  );
  await drawRightBar(
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
  await drawLeftBar(
    centerX - sportsLeftWidth,
    startingY + step,
    sportsLeftWidth,
    BAR_HEIGHT,
    '🏃‍♀️'
  );
  await drawRightBar(
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
  await drawLeftBar(
    centerX - placeLeftWidth,
    startingY + step,
    placeLeftWidth,
    BAR_HEIGHT,
    '🏔'
  );
  await drawRightBar(
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
  await drawLeftBar(
    centerX - foodLeftWidth,
    startingY + step,
    foodLeftWidth,
    BAR_HEIGHT,
    '🌯'
  );
  await drawRightBar(
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
  await drawLeftBar(
    centerX - entertainmentLeftWidth,
    startingY + step,
    entertainmentLeftWidth,
    BAR_HEIGHT,
    '📺'
  );
  await drawRightBar(
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
  await drawLeftBar(
    centerX - drinkLeftWidth,
    startingY + step,
    drinkLeftWidth,
    BAR_HEIGHT,
    '☕️'
  );
  await drawRightBar(
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
  const imgUrl = await drawPreferenceChart(updatedResult);
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
