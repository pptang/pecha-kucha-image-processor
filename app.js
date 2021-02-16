const fs = require('fs');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/generate-ikigai', async (req, res) => {
  const width = 1000;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const img = await loadImage('./ikigai.png');
  ctx.drawImage(img, 15, 30);
  ctx.font = '16px serif';
  const data = req.body;
  ctx.fillText(data.love, 397, 207);
  ctx.fillText(data.happy, 402, 429);
  ctx.fillText(data.skill, 621, 418);
  ctx.fillText(data.help, 479, 330);
  ctx.fillText(data.inspire, 302, 323);
  ctx.fillText(data.angry, 470, 503);
  ctx.fillText(data.sell, 380, 596);
  ctx.fillText(data.job, 308, 495);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./public/image.png', buffer);
  res.json(
    JSON.stringify({
      imgUrl: 'http://localhost:3000/image.png',
    })
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
