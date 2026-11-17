import * as XLSX from 'xlsx';

/**
 * Report exports.
 *
 * Excel: the report's own columns with their labels, every row and a total row.
 * PDF: each A4 page is laid out in HTML and captured as an image, so Tamil and other scripts
 * print correctly (the PDF fonts only cover English). Rows flow onto as many pages as needed;
 * every page repeats the report header, the table header and the footer with page numbers.
 *
 * columns: [{ key, label, align, value(row) → text/number }]
 */

const cellValue = (col, row, index) => (col.key === 'sNo' ? index + 1 : col.value ? col.value(row) : row[col.key]);

export const exportExcel = ({ fileName, sheetName, columns, rows, totals, extraSheets = [] }) => {
  const header = columns.map((c) => c.label);
  const body = rows.map((r, i) => columns.map((c) => cellValue(c, r, i) ?? ''));
  const aoa = [header, ...body];
  if (totals) aoa.push(columns.map((c, i) => (i === 0 ? totals.label : totals.values[c.key] ?? '')));
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = columns.map((c) => ({ wch: Math.min(40, Math.max(String(c.label).length, ...body.map((r, i) => String(r[columns.indexOf(c)] ?? '').length)) + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, String(sheetName).slice(0, 31));
  extraSheets.forEach((sh) => {
    const sheet = XLSX.utils.aoa_to_sheet([sh.columns.map((c) => c.label), ...sh.rows.map((r, i) => sh.columns.map((c) => cellValue(c, r, i) ?? ''))]);
    XLSX.utils.book_append_sheet(wb, sheet, String(sh.name).slice(0, 31));
  });
  XLSX.writeFile(wb, fileName);
};

// ---------------------------------------------------------------- PDF

const PAGE_W = 794; // A4 at 96 dpi
const PAGE_H = 1123;
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const pageShell = (title, info) => {
  const page = document.createElement('div');
  page.style.cssText = `width:${PAGE_W}px;height:${PAGE_H}px;background:#fff;color:#0f172a;display:flex;flex-direction:column;box-sizing:border-box;font-family:'Noto Sans Tamil','Latha','Nirmala UI',Inter,system-ui,sans-serif;font-size:12px;`;
  page.innerHTML = `
    <div style="background:#312e81;color:#fff;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px">
      <div style="font-size:11px;opacity:.85;min-width:150px">${esc(info.reportDateLabel)}: ${esc(fmtDate(info.reportDate))}</div>
      <div style="font-size:17px;font-weight:700;text-align:center">${esc(title)}</div>
      <div style="font-size:11px;opacity:.85;min-width:150px;text-align:right">${esc(info.generatedByLabel)}: ${esc(info.generatedBy)}</div>
    </div>
    <div data-body style="flex:1;overflow:hidden;padding:22px 28px"></div>
    <div style="background:#f1f5f9;color:#475569;padding:10px 28px;display:flex;justify-content:space-between;font-size:10.5px">
      <span>${esc(info.poweredByLabel)}: ${esc(info.poweredBy)} · ${esc(info.supportLabel)}: ${esc(info.supportPhone)}</span>
      <span data-pageno></span>
    </div>`;
  return page;
};

const tableHead = (columns) =>
  `<thead><tr>${columns
    .map((c) => `<th style="background:#eef2ff;color:#312e81;text-align:${c.align || 'left'};padding:7px 8px;border-bottom:2px solid #c7d2fe;font-weight:700">${esc(c.label)}</th>`)
    .join('')}</tr></thead>`;

// Numbers print Indian style (36,891); the serial number stays plain.
const pdfText = (v, key) => (typeof v === 'number' && key !== 'sNo' ? v.toLocaleString('en-IN') : v);

const rowHtml = (columns, row, index, strong) =>
  `<tr style="${strong ? 'background:#eef2ff;font-weight:800' : index % 2 ? 'background:#f8fafc' : ''}">${columns
    .map((c) => `<td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:${c.align || 'left'};vertical-align:top">${esc(pdfText(strong ? row[c.key] ?? '' : c.pdf ? c.pdf(row) : cellValue(c, row, index), c.key))}</td>`)
    .join('')}</tr>`;

/**
 * Builds and downloads the PDF. info: { functionName, functionDate, persons, place, reportDate, generatedBy,
 * poweredBy, supportPhone } plus the labels used on the pages. summary: [[label, value]] shown on the cover.
 */
export const downloadReportPdf = async ({ fileName, title, columns, rows, totals, info, summary = [] }) => {
  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-20000px;top:0;z-index:-1';
  document.body.appendChild(holder);
  const pages = [];
  try {
    // Cover: function details and the report's totals.
    const cover = pageShell(title, info);
    const details = [
      [info.functionNameLabel, info.functionName],
      [info.functionDateLabel, fmtDate(info.functionDate)],
      [info.personsLabel, info.persons],
      [info.placeLabel, info.place],
    ].filter(([, v]) => v);
    cover.querySelector('[data-body]').innerHTML = `
      <div style="text-align:center;margin:60px 0 28px">
        <div style="font-size:44px">🎉</div>
        <div style="font-size:26px;font-weight:800;margin-top:8px">${esc(info.functionName || title)}</div>
        <div style="font-size:15px;color:#64748b;margin-top:4px">${esc(title)}</div>
      </div>
      <table style="width:80%;margin:0 auto;border-collapse:collapse;font-size:14px">
        ${details.map(([l, v]) => `<tr><td style="padding:10px 14px;border:1px solid #cbd5e1;color:#475569;width:40%">${esc(l)}</td><td style="padding:10px 14px;border:1px solid #cbd5e1;font-weight:700">${esc(v)}</td></tr>`).join('')}
      </table>
      ${summary.length ? `<div style="display:flex;gap:14px;justify-content:center;margin-top:36px;flex-wrap:wrap">${summary
        .map(([l, v]) => `<div style="border:1px solid #c7d2fe;background:#eef2ff;border-radius:10px;padding:14px 22px;text-align:center;min-width:140px"><div style="color:#4338ca;font-size:12px">${esc(l)}</div><div style="font-size:22px;font-weight:800;margin-top:4px">${esc(v)}</div></div>`)
        .join('')}</div>` : ''}`;
    holder.appendChild(cover);
    pages.push(cover);

    // Table pages: add rows until the page is full, then start a new page.
    const allRows = rows.map((r, i) => rowHtml(columns, r, i, false));
    if (totals) allRows.push(rowHtml(columns, { ...totals.values, [columns[0].key]: totals.label }, 0, true));
    let i = 0;
    while (i < allRows.length || pages.length === 1) {
      const page = pageShell(title, info);
      const body = page.querySelector('[data-body]');
      body.innerHTML = `<table style="width:100%;border-collapse:collapse">${tableHead(columns)}<tbody></tbody></table>`;
      const tbody = body.querySelector('tbody');
      holder.appendChild(page);
      pages.push(page);
      let added = 0;
      while (i < allRows.length) {
        tbody.insertAdjacentHTML('beforeend', allRows[i]);
        if (body.scrollHeight > body.clientHeight && added > 0) {
          tbody.lastElementChild.remove();
          break;
        }
        added += 1;
        i += 1;
      }
      if (allRows.length === 0) break;
    }
    pages.forEach((p, n) => {
      p.querySelector('[data-pageno]').textContent = `${info.pageLabel} ${n + 1} / ${pages.length}`;
    });

    const pdf = new JsPDF('p', 'mm', 'a4');
    for (let n = 0; n < pages.length; n += 1) {
      const canvas = await html2canvas(pages[n], { scale: 2, backgroundColor: '#ffffff', logging: false });
      if (n > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
    }
    pdf.save(fileName);
  } finally {
    holder.remove();
  }
};
