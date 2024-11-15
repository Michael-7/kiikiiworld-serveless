const sharp = require('sharp');
const fs = require('fs');

readFiles();

async function readFiles() {
  const files = fs.readdirSync('./format-img')

  files.forEach(file => {
    if (
      file.includes(".jpg") ||
      file.includes(".png") ||
      file.includes(".JPG")
    ) {
      sharp(`./format-img/${file}`)
        .resize(1200, undefined, { withoutEnlargement: true })
        .toFile(`./format-img/out/${file}`);
      console.log(file + " done!");
    }
  });
}

