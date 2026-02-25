const fs = require('fs');
const path = require('path');
const base = path.join('src','language','json');
const en = JSON.parse(fs.readFileSync(path.join(base,'en.json'),'utf8'));
const langs = ['hi','kn','ml','te'];
const out = {};
langs.forEach(l => {
  const p = path.join(base, l + '.json');
  const data = JSON.parse(fs.readFileSync(p,'utf8'));
  const missing = [];
  Object.keys(en).forEach(k => {
    if (!(k in data)) missing.push({ key: k, value: en[k] });
  });
  out[l] = missing;
});
console.log(JSON.stringify(out, null, 2));
