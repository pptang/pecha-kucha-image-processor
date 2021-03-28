const fs = require('fs');
const express = require('express');
const { createCanvas } = require('canvas');
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

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
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
const drawPreferenceChart = async (data) => {
  const canvas = createCanvas(1280, 600);
  const ctx = canvas.getContext('2d');
  // Fill the background color for the whole image
  ctx.fillStyle = '#553D3D';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;

  const drawLeftBar = async (x, y, width, height, emoji) => {
    ctx.beginPath();
    ctx.fillStyle = '#FEF9EB';
    roundRect(
      ctx,
      x,
      y,
      width,
      height,
      5,
      {
        tl: 6,
        bl: 6,
      },
      true
    );

    ctx.font = '20px serif';
    await fillTextWithTwemoji(
      ctx,
      emoji,
      x === centerX ? x - 50 : x + 5,
      y + 25
    );
  };

  const drawRightBar = async (x, y, width, height, emoji) => {
    ctx.beginPath();
    ctx.fillStyle = '#FEF9EB';
    roundRect(
      ctx,
      x,
      y,
      width,
      height,
      5,
      {
        tr: 6,
        br: 6,
      },
      true
    );
    ctx.fill();
    ctx.font = '20px serif';
    await fillTextWithTwemoji(
      ctx,
      emoji,
      width === 0 ? x + 25 : x + width - 25,
      y + 25
    );
  };

  const BAR_HEIGHT = 40;
  const startingY = 50;
  const leftRightBarMargin = 1;
  const usableWidth = canvas.width / 2 - 50;
  let step = 0;
  const preferences = Object.keys(data);
  for (const preference of preferences) {
    const resultArr = Object.keys(data[preference]);
    const left = resultArr[0];
    const right = resultArr[1];
    const leftWeight = data[preference][left];
    const rightWeight = data[preference][right];
    const leftWidth = usableWidth * (leftWeight / (leftWeight + rightWeight));
    const rightWidth = usableWidth * (rightWeight / (leftWeight + rightWeight));
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
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
