const { execSync } = require('child_process');
const path = require('path');

const mapping = {
  'apple_preview.png': 'apple.svg',
  'cherry_ref.png': 'cherry.svg',
  'peach_ref.png': 'peach.svg',
  'pear_ref.png': 'pear.svg',
  'orange_ref.png': 'orange.svg',
  'coconut_ref.png': 'coconut.svg',
  'watermelon_ref.png': 'watermelon.svg',
  'persimmon_ref.png': 'persimmon.svg',
  'chestnut_ref.png': 'chestnut.svg',
  'golden_apple_ref.png': 'golden_apple.svg',
  'meteor_ref.png': 'meteor.svg',
};

const inputDir = path.resolve(__dirname, '..', 'generated-images');
const outputDir = path.resolve(__dirname, '..', 'public', 'sprites');
const script = path.resolve(__dirname, 'png2svg.cjs');

for (const [png, svg] of Object.entries(mapping)) {
  const input = path.join(inputDir, png);
  const output = path.join(outputDir, svg);
  console.log(`Converting ${png} → ${svg} ...`);
  try {
    execSync(`node "${script}" "${input}" "${output}"`, {
      stdio: 'inherit',
      timeout: 120000,
    });
  } catch (err) {
    console.error(`Failed: ${png}`, err.message);
  }
}
console.log('Done.');
