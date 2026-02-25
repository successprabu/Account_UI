const fs = require('fs');
const path = require('path');
const base = path.join('src','language','json');
const en = JSON.parse(fs.readFileSync(path.join(base,'en.json'),'utf8'));
const langs = ['hi','kn','ml','te'];
langs.forEach(l => {
  const p = path.join(base, l + '.json');
  const data = JSON.parse(fs.readFileSync(p,'utf8'));
  const merged = {};
  // preserve existing translations and add missing keys from en
  Object.keys(en).forEach(k => {
    if (k in data) merged[k] = data[k];
    else merged[k] = en[k];
  });
  // also include any extra keys present in target but not in en
  Object.keys(data).forEach(k => { if (!(k in merged)) merged[k] = data[k]; });
  const outPath = path.join('scripts', `merged_${l}.json`);
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`Wrote ${outPath}`);
});
