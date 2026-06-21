import * as XLSX from 'xlsx';

/**
 * Download an Excel (.xlsx) file containing the name + mobile of all customers.
 * Mobile values stay as text strings so leading zeros are preserved.
 */
export function exportCustomersExcel(customers = []) {
  const rows = customers.map((c, i) => ({
    'ردیف': i + 1,
    'نام و نام خانوادگی': c.name || '',
    'شماره موبایل': String(c.mobile || ''),
    'جنسیت': c.gender || '',
    'آدرس': c.address || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 16 }, { wch: 8 }, { wch: 34 }];

  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] }; // right-to-left sheet
  XLSX.utils.book_append_sheet(wb, ws, 'مشتریان');

  const today = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
  XLSX.writeFile(wb, `مشتریان-صافیار-${today}.xlsx`);
}
