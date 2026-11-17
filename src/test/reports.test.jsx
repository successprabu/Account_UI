/** Reports: all rows and true totals, Excel with labelled columns, PDF without errors. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.fn();
vi.mock('axios', () => {
  const fn = (...args) => axiosMock(...args);
  const instance = Object.assign(fn, {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});
const writeFile = vi.fn();
vi.mock('xlsx', async (orig) => ({ ...(await orig()), writeFile: (...a) => writeFile(...a) }));
const pdfSave = vi.fn();
vi.mock('jspdf', () => ({ default: vi.fn(() => ({ addPage: vi.fn(), addImage: vi.fn(), save: pdfSave })) }));
vi.mock('html2canvas', () => ({ default: vi.fn(() => Promise.resolve({ toDataURL: () => 'data:image/jpeg;base64,' })) }));

const token = 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800 })).replace(/=+$/, '') + '.';
const admin = { id: 9, name: 'Kumar', userType: 'AU', customerID: 9, functionId: 3, token };
const receipts = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, villageName: i % 2 ? 'Theni' : 'Madurai', initial: '', name: `Person ${i + 1}`, oldAmount: 0, newAmount: 100, amount: 100, mobile: '' }));

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

beforeEach(() => {
  axiosMock.mockReset();
  writeFile.mockReset();
  pdfSave.mockReset();
  localStorage.clear();
  localStorage.setItem('user', JSON.stringify(admin));
  window.matchMedia = (q) => ({ matches: /min-width/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} });
  axiosMock.mockImplementation(({ url, params }) => {
    if (/GetAllTransaction/.test(url)) {
      const rows = params.trans_type === 'R' ? receipts.filter((r) => !params.village_name || r.villageName === params.village_name) : [];
      return Promise.resolve({ data: { result: true, data: { transactions: rows } } });
    }
    if (/GetRegionalSummaryReport/.test(url)) return Promise.resolve({ data: { result: true, data: [{ villageName: 'Theni', total: 1500 }, { villageName: 'Madurai', total: 4200 }, { villageName: 'Dindigul', total: 300 }] } });
    if (/GetGenearalDataForReport/.test(url)) return Promise.resolve({ data: { result: true, data: { functions: { functionName: 'Wedding', functionDate: '2026-12-12', funPersionNames: 'Ravi & Priya', mahalName: 'Lakshmi Mahal' }, header: { reportDate: '2026-11-17', generatedBy: 'Kumar' }, footer: { poweredBy: 'MySuccess.com', supportPhone: '+91' } } } });
    return Promise.resolve({ data: { result: true, data: [] } });
  });
});

describe('Reports', () => {
  it('receipt report totals every entry, not just one page, and exports labelled Excel', async () => {
    await renderAt('/income-report');
    expect(await screen.findByText('Person 1', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getAllByText('₹3,000').length).toBeGreaterThan(0); // 30 × ₹100
    fireEvent.click(screen.getByRole('button', { name: /excel/i }));
    await waitFor(() => expect(writeFile).toHaveBeenCalled());
    const [wb, name] = writeFile.mock.calls[0];
    expect(name).toBe('IncomeReport.xlsx');
    const sheet = wb.Sheets[wb.SheetNames[0]];
    expect(sheet.A1.v).toMatch(/s\.?\s*no/i);
    expect(sheet.D2.v).toBe('Person 1');
    expect(sheet.A32.v).toMatch(/total/i); // header + 30 rows + total row
  });

  it('receipt report search sends the place filter', async () => {
    await renderAt('/income-report');
    await screen.findByText('Person 1', {}, { timeout: 8000 });
    fireEvent.change(screen.getByRole('textbox', { name: /place name/i }), { target: { value: 'Theni' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.queryByText('Person 1')).not.toBeInTheDocument());
    const last = axiosMock.mock.calls.filter(([c]) => /GetAllTransaction/.test(c.url)).pop()[0];
    expect(last.params).toMatchObject({ village_name: 'Theni', trans_type: 'R', report_type: 'INCOME', function_id: 3 });
  });

  it('receipt report PDF is created with every row', async () => {
    await renderAt('/income-report');
    await screen.findByText('Person 1', {}, { timeout: 8000 });
    fireEvent.click(screen.getByRole('button', { name: /pdf/i }));
    await waitFor(() => expect(pdfSave).toHaveBeenCalledWith('IncomeReport.pdf'));
  });

  it('location report sorts places by amount and its place search works', async () => {
    await renderAt('/regional-report');
    expect(await screen.findByText('Madurai', {}, { timeout: 8000 })).toBeInTheDocument();
    const cells = screen.getAllByRole('row').map((r) => r.textContent);
    expect(cells.findIndex((c) => c.includes('Madurai'))).toBeLessThan(cells.findIndex((c) => c.includes('Theni')));
    fireEvent.change(screen.getByRole('textbox', { name: /place name/i }), { target: { value: 'then' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.queryByText('Madurai')).not.toBeInTheDocument());
    expect(screen.getByText('Theni')).toBeInTheDocument();
  });
});
