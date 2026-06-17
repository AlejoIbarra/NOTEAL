const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');
let pngToIco = require('png-to-ico');
if (typeof pngToIco !== 'function' && pngToIco.default) {
  pngToIco = pngToIco.default;
}

async function run() {
  try {
    const pngPath = path.join(__dirname, 'src', 'assets', 'icon.png');
    const icoPath = path.join(__dirname, 'src', 'assets', 'icon.ico');
    
    console.log('Leyendo y procesando imagen PNG...');
    const image = await Jimp.read(pngPath);
    // Asegurarse de que esté en formato PNG correcto
    const pngBuffer = await image.getBuffer('image/png');
    fs.writeFileSync(pngPath, pngBuffer);
    console.log('Imagen lista como PNG real.');

    console.log('Convirtiendo PNG a ICO...');
    const buf = await pngToIco(pngPath);
    fs.writeFileSync(icoPath, buf);
    console.log('Icono .ico generado con éxito!');
  } catch (err) {
    console.error('Error procesando icono:', err);
  }
}

run();
