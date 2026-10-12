import xlsx from 'xlsx';
import path from 'path';

const filePath = path.join('..', 'قوه 2222.xlsx');
const workbook = xlsx.readFile(filePath);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`Sheet: ${name}, Total rows: ${rows.length}`);
  if (rows.length > 0) {
    console.log(`  Headers:`, rows[0]);
    if (rows.length > 1) {
      console.log(`  Sample 1:`, rows[1]);
    }
  }
}

// Let's inspect distinct values of 'الوظيفة' in sheet 1
const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
const allRows = xlsx.utils.sheet_to_json(sheet1);
const types = new Set(allRows.map(r => r['الوظيفة']));
console.log('Distinct job values:', Array.from(types));
console.log('Total objects:', allRows.length);
