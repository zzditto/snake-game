const { PNG } = require('pngjs');
const ImageTracer = require('imagetracerjs');
const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error('Usage: node scripts/png2svg.cjs <input.png> <output.svg>');
  process.exit(1);
}

fs.createReadStream(input)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function () {
    const imageData = {
      width: this.width,
      height: this.height,
      data: new Uint8Array(this.data),
    };

    const options = {
      colorsampling: 0,
      numberofcolors: 32,
      mincolorratio: 0.01,
      colorquantcycles: 3,
      layering: 0,
      strokewidth: 1,
      linefilter: true,
      scale: 1,
      roundcoords: 2,
      desc: false,
      viewbox: true,
      blurradius: 0,
      blurdelta: 20,
    };

    const svgstr = ImageTracer.imagedataToSVG(imageData, options);
    fs.writeFileSync(output, svgstr);
    console.log(`Saved: ${output} (${svgstr.length} bytes)`);
  })
  .on('error', function (err) {
    console.error('PNG error:', err);
    process.exit(1);
  });
