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

const emojiMap = {
  tea: '🍵',
  coffee: '☕️',
  wine: '🍷',
  beer: '🍺',
  ski: '⛷',
  snowboard: '🏂',
  lion: '🦁',
  sheep: '🐑',
  dog: '🐶',
  cat: '😸',
  arrow: '🏹',
  farmer: '👩‍🌾',
  burger: '🍔',
  sushi: '🍣',
  mountain: '⛰',
  sea: '🌊',
  day: '🌞',
  night: '🧛‍♂️',
  gym: '🏋️‍♂️',
  running: '🏃‍♀️',
};

const drawPreferenceChart = async (data) => {
  const canvas = createCanvas(1280, 600);
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
  let step = 0;
  const preferences = Object.keys(data);
  for (const preference of preferences) {
    const resultArr = Object.keys(data[preference]);
    const left = resultArr[0];
    const right = resultArr[1];
    const leftWeight = data[preference][left];
    const rightWeight = data[preference][right];
    const leftWidth =
      (canvas.width / 2) * (leftWeight / (leftWeight + rightWeight));
    const rightWidth =
      (canvas.width / 2) * (rightWeight / (leftWeight + rightWeight));
    await drawLeftBar(
      centerX - leftWidth,
      startingY + step,
      leftWidth,
      BAR_HEIGHT,
      emojiMap[left]
    );
    await drawRightBar(
      centerX + leftRightBarMargin,
      startingY + step,
      rightWidth,
      BAR_HEIGHT,
      emojiMap[right]
    );
    step += 50;
  }
  // Draw the center vertical line
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.fillStyle = 'black';
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  const imgName = `image-${getRandomInt(5000)}`;
  fs.writeFileSync(`./public/${imgName}.png`, buffer);
  return `https://pecha-kucha-mashi-mashi.herokuapp.com/${imgName}.png`;
};

app.post('/generate-preference-chart', async (req, res) => {
  // 1. Get vote result
  const {
    channelId,
    drink,
    alcohol,
    winter,
    manager,
    communication,
    working,
    food,
    place,
    energy,
    exercise,
  } = req.body;

  // 2. Retrieve current preference in DB

  const preferenceRef = db.collection('preference').doc(channelId);
  // 3. Update DB
  await db.runTransaction(async (t) => {
    const doc = await t.get(preferenceRef);
    if (!doc.exists) {
      t.set(preferenceRef, {
        drink: {
          coffee: 0,
          tea: 0,
        },
        alcohol: { beer: 0, wine: 0 },
        winter: { ski: 0, snowboard: 0 },
        manager: { sheep: 0, lion: 0 },
        communication: { cat: 0, dog: 0 },
        working: { farmer: 0, arrow: 0 },
        food: { sushi: 0, burger: 0 },
        place: { sea: 0, mountain: 0 },
        energy: { day: 0, night: 0 },
        exercise: { running: 0, gym: 0 },
      });
      t.update(preferenceRef, {
        [`drink.${drink}`]: 1,
        [`alcohol.${alcohol}`]: 1,
        [`winter.${winter}`]: 1,
        [`manager.${manager}`]: 1,
        [`communication.${communication}`]: 1,
        [`working.${working}`]: 1,
        [`food.${food}`]: 1,
        [`place.${place}`]: 1,
        [`energy.${energy}`]: 1,
        [`exercise.${exercise}`]: 1,
      });
    } else {
      t.update(preferenceRef, {
        [`drink.${drink}`]: doc.data().drink[drink] + 1,
        [`alcohol.${alcohol}`]: doc.data().alcohol[alcohol] + 1,
        [`winter.${winter}`]: doc.data().winter[winter] + 1,
        [`manager.${manager}`]: doc.data().manager[manager] + 1,
        [`communication.${communication}`]:
          doc.data().communication[communication] + 1,
        [`working.${working}`]: doc.data().working[working] + 1,
        [`food.${food}`]: doc.data().food[food] + 1,
        [`place.${place}`]: doc.data().place[place] + 1,
        [`energy.${energy}`]: doc.data().energy[energy] + 1,
        [`exercise.${exercise}`]: doc.data().exercise[exercise] + 1,
      });
    }
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
