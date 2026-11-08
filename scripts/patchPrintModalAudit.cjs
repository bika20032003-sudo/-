const fs = require('fs');
const path = require('path');

const printFiles = [
  path.join(__dirname, '..', 'src', 'components', 'OfficialPrintModal.jsx'),
  path.join(__dirname, '..', 'منظومة جهاز الاشراف', 'src', 'components', 'OfficialPrintModal.jsx')
];

const replacement = `{/* Additional Items Section (بنود إضافية خارج العقد) */}
              {Array.isArray(report.additionalItems) && report.additionalItems.length > 0 && (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'center',
                  fontSize: '0.76rem',
                  border: '1.5px solid #000000',
                  marginBottom: '10px'
                }}>
                  <thead>
                    <tr style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 900 }}>
                      <th colSpan={6} style={{ border: '1px solid #000000', padding: '4px 8px', textAlign: 'right', fontSize: '0.82rem' }}>
                        بنود إضافية (أعمال خارج نطاق العقد الأصلي - لا تُضاف لإجمالي العقد ولا لنسبة الإنجاز التعاقدية)
                      </th>
                    </tr>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                      <th style={{ border: '1px solid #000000', padding: '4px 2px', width: '34px', fontWeight: 900 }}>البند</th>
                      <th style={{ border: '1px solid #000000', padding: '4px 6px', textAlign: 'right', fontWeight: 900 }}>الوصف</th>
                      <th style={{ border: '1px solid #000000', padding: '4px 2px', width: '55px', fontWeight: 900 }}>الوحدة</th>
                      <th style={{ border: '1px solid #000000', padding: '4px 3px', width: '92px', fontWeight: 900 }}>المنفذ</th>
                      <th style={{ border: '1px solid #000000', padding: '4px 3px', width: '85px', fontWeight: 900 }}>الفئة (د.ل)</th>
                      <th style={{ border: '1px solid #000000', padding: '4px 3px', width: '120px', fontWeight: 900 }}>قيمة المنفذ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.additionalItems.map((item, idx) => (
                      <tr key={item.id || idx} style={{ pageBreakInside: 'avoid' }}>
                        <td style={{ border: '1px solid #000000', padding: '3px 2px', fontWeight: 800 }}>{item.itemNumber || idx + 1}</td>
                        <td style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{item.description}</td>
                        <td style={{ border: '1px solid #000000', padding: '3px 2px', fontWeight: 700 }}>{item.unit}</td>
                        <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 800 }} dir="ltr">{fmtNum(item.executedQuantity)}</td>
                        <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 800 }} dir="ltr">{fmtNum(item.unitRate)}</td>
                        <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">{fmtNum(item.executedValue)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #000000', pageBreakInside: 'avoid' }}>
                      <td colSpan={5} style={{ border: '1px solid #000000', padding: '5px 10px', textAlign: 'left', fontSize: '0.85rem' }}>
                        إجمالي البنود الإضافية (خارج العقد):
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '0.88rem', fontWeight: 900, color: '#0369a1' }} dir="ltr">
                        {fmtNum(report.calculations?.additionalExecutedSum || (report.additionalItems || []).reduce((acc, it) => acc + (Number(it.executedValue) || 0), 0))} د.ل
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}`;

printFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /\{\/\* تم إلغاء البنود الإضافية: التجميع والاعتماد للبنود الأساسية فقط \*\/\}/,
    replacement
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched print modal:', filePath);
});
