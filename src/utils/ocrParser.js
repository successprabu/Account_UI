// Minimal OCR wrapper and a simple text->records parser.
// Uses tesseract.js if available; otherwise, provides a fallback stub.

export async function ocrParser(file, onProgress = () => {}) {
  try {
    // dynamic import so app doesn't crash if tesseract isn't installed yet
    const Tesseract = await import('tesseract.js');
    const worker = Tesseract.createWorker({
      logger: (m) => {
        onProgress(m);
      },
    });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();
    return data?.text || '';
  } catch (err) {
    console.warn('tesseract.js not available or OCR failed, using fallback text. Error:', err);
    // fallback: return filename as text so parser can still try
    return `FILE:${file.name}`;
  }
}

export function parseTextToRecords(text) {
  // Very naive parser: split into lines and extract first number as amount
  const lines = (text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const records = [];
  if (lines.length === 0) return records;

  // If text contains multiple records separated by blank lines, try splitting by double newline
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  (blocks.length > 0 ? blocks : [text]).forEach((block, blockIdx) => {
    const blines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rec = {
      _importId: Date.now() + Math.floor(Math.random()*1000) + blockIdx,
      villageName: blines[0] || '',
      name: blines[1] || '',
      initial: blines[2] || '',
      oldAmount: 0,
      newAmount: 0,
      amount: 0,
      phoneNo: '',
      remarks: blines.slice(3).join(' ') || block,
    };

    // find amounts in text
    const amounts = (block.match(/\d+[.,]?\d*/g) || []).map(a => Number(a.replace(/,/g, '')));
    if (amounts.length === 1) {
      rec.newAmount = amounts[0];
      rec.amount = amounts[0];
    } else if (amounts.length >= 2) {
      rec.oldAmount = amounts[0];
      rec.newAmount = amounts[1];
      rec.amount = rec.oldAmount + rec.newAmount;
    }

    // phone detection
    const phone = block.match(/\d{7,15}/);
    if (phone) rec.phoneNo = phone[0];

    records.push(rec);
  });

  return records;
}
