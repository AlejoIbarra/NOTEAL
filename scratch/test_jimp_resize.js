const { Jimp } = require('jimp');
const path = require('path');

async function run() {
  try {
    const pngPath = path.join(__dirname, '..', 'src', 'assets', 'icon.png');
    const image = await Jimp.read(pngPath);
    console.log('Image dimensions:', image.width, 'x', image.height);
    console.log('Calling resize...');
    image.resize({ w: 256, h: 256 });
    console.log('Resized dimensions:', image.width, 'x', image.height);
  } catch (e) {
    console.error('Resize failed:', e);
  }
}
run();
