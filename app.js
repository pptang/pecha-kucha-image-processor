const fs = require('fs');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
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
  ctx.fillText('Hello world', 368, 168);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./public/image.png', buffer);
  res.json({
    imgUrl: 'http://localhost:3000/image.png',
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
