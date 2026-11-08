const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'src', 'components', 'ExecutiveProgressForm.jsx'),
  path.join(__dirname, '..', 'منظومة جهاز الاشراف', 'src', 'components', 'ExecutiveProgressForm.jsx')
];

filesToPatch.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update calculations to compute additionalExecutedSum from additionalItems while keeping grandExecutedSum = basicExecutedSum
  content = content.replace(
    /const additionalExecutedSum = 0;\r?\n\s*const grandExecutedSum = basicExecutedSum;/,
    `const additionalExecutedSum = additionalItems.reduce((acc, curr) => acc + (parseFloat(toCleanLatin(curr.executedValue)) || 0), 0);\r\n    const grandExecutedSum = basicExecutedSum;`
  );

  // 2. Add outdated cache check in loadExecutiveData
  if (!content.includes('isOutdatedOrShifted')) {
    content = content.replace(
      /const loadExecutiveData = async \(\) => \{/,
      `const loadExecutiveData = async () => {\r\n      const isOutdatedOrShifted = (items = []) => {\r\n        return items.some(it => String(it.itemNumber) === '8' && (String(it.contractQuantity) === '720000' || Number(it.contractQuantity) === 720000)) ||\r\n               items.some(it => String(it.itemNumber) === '11' && (String(it.contractQuantity) === '240000' || Number(it.contractQuantity) === 240000));\r\n      };`
    );

    content = content.replace(
      /if \(local\) \{\r?\n\s*const parsed = JSON\.parse\(local\);/,
      `if (local) {\r\n            const parsed = JSON.parse(local);\r\n            if (parsed.basicItems && isOutdatedOrShifted(parsed.basicItems)) {\r\n              setData(initialExecutiveData);\r\n              try { localStorage.setItem('executive_progress_data', JSON.stringify(initialExecutiveData)); } catch (_) {}\r\n              setIsLoading(false);\r\n              return;\r\n            }`
    );
  }

  // 3. Update Summary Cards (Cards 2 & 3)
  content = content.replace(
    /<span style=\{\{\s*fontSize:\s*'0\.82rem',\s*color:\s*'#bbf7d0',\s*fontWeight:\s*700\s*\}\}>إجمالي المنفذ \(أساسي \+ إضافي\)<\/span>/,
    `<span style={{ fontSize: '0.82rem', color: '#bbf7d0', fontWeight: 700 }}>إجمالي المنفذ التعاقدي (البنود الأساسية)</span>`
  );

  content = content.replace(
    /نسبة الإنجاز المالي العام: <strong dir="ltr">%\{calculations\.overallFinancialPercentage\}<\/strong>/,
    `نسبة إنجاز العقد التعاقدية: <strong dir="ltr">%{calculations.overallFinancialPercentage}</strong>`
  );

  content = content.replace(
    /\{\/\* Card 3: Basic Items Value & Rate \*\/\}\r?\n\s*<div style=\{\{\s*background:\s*'#ffffff',[\s\S]*?نسبة إنجاز الأساسية: <strong dir="ltr">%\{calculations\.basicPercentage\}<\/strong><\/span>\s*<\/div>\s*<\/div>/,
    `{/* Card 3: Additional Items Total (Explicitly Excluded from Contract) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 800 }}>إجمالي البنود الإضافية (خارج العقد)</span>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0284c7', margin: '0.35rem 0', direction: 'ltr', textAlign: 'right' }}>
            {fmt(calculations.additionalExecutedSum)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>د.ل</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 700, fontSize: '0.74rem' }}>
            <span>⚠️ مستبعدة من جمع العقد طبقاً لتوجيهات جهاز الإشراف</span>
          </div>
        </div>`
  );

  // 4. Update Basic Items Table Header to include unitRate (الفئة)
  content = content.replace(
    /<th style=\{\{\s*width:\s*'110px',\s*textAlign:\s*'center',\s*padding:\s*'0\.6rem 0\.4rem'\s*\}\}>المتبقي<\/th>\r?\n\s*<th style=\{\{\s*width:\s*'140px',\s*textAlign:\s*'center',\s*padding:\s*'0\.6rem 0\.4rem'\s*\}\}>قيمة المنفذ \(د\.ل\)<\/th>/,
    `<th style={{ width: '100px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المتبقي</th>\r\n                <th style={{ width: '95px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الفئة (د.ل)</th>\r\n                <th style={{ width: '130px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>`
  );

  // 5. Update Basic Items Table Row to include unitRate (الفئة)
  content = content.replace(
    /(<input[^>]*?onChange=\{\(e\) => handleBasicItemChange\(idx, 'remainingQuantity'[\s\S]*?<\/td>)\r?\n\s*(<td style=\{\{\s*textAlign:\s*'center'\s*\}\}>\r?\n\s*\{readOnlyMode \? \(\r?\n\s*<strong style=\{\{\s*color:\s*'#0f172a'\s*\}\} dir="ltr">\{fmt\(item\.executedValue\)\}<\/strong>)/,
    `$1\r\n                      <td style={{ textAlign: 'center' }}>\r\n                        {readOnlyMode ? (\r\n                          <span style={{ fontWeight: 800, color: '#334155' }} dir="ltr">{item.unitRate ? fmt(item.unitRate) : '—'}</span>\r\n                        ) : (\r\n                          <input\r\n                            type="text"\r\n                            inputMode="decimal"\r\n                            lang="en-US"\r\n                            dir="ltr"\r\n                            value={toCleanLatin(item.unitRate ?? '')}\r\n                            onChange={(e) => handleBasicItemChange(idx, 'unitRate', e.target.value)}\r\n                            style={{ width: '85px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, color: '#334155', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}\r\n                          />\r\n                        )}\r\n                      </td>\r\n                      $2`
  );

  // 6. Restore and enhance Additional Items Table right under the Basic Items Table
  const additionalTableHtml = `{/* Additional Items Table (بنود إضافية خارج العقد) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '0.3rem 0.8rem',
              borderRadius: '6px',
              fontWeight: 900,
              fontSize: '0.85rem'
            }}>
              بنود إضافية
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
              (أعمال منفذة خارج نطاق العقد الأصلي - لا تُضاف لإجمالي العقد ولا تؤثر على نسبة الإنجاز التعاقدية)
            </span>
          </div>

          <span style={{
            background: '#fef3c7',
            color: '#b45309',
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.76rem',
            fontWeight: 800,
            border: '1px solid #fde68a'
          }}>
            🔒 منفصلة تماماً عن حسابات العقد
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>البند</th>
                <th style={{ minWidth: '300px', padding: '0.6rem 0.75rem' }}>الوصف المعتمد للبند الإضافي</th>
                <th style={{ width: '75px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الوحدة</th>
                <th style={{ width: '120px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المنفذ</th>
                <th style={{ width: '100px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الفئة (د.ل)</th>
                <th style={{ width: '150px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>
                <th style={{ minWidth: '200px', padding: '0.6rem 0.75rem' }}>ملاحظات الحصر الميداني</th>
              </tr>
            </thead>
            <tbody>
              {data.additionalItems.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#475569' }}>
                    {toCleanLatin(item.itemNumber || idx + 1)}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>
                    {item.description}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                    {item.unit}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <span style={{ fontWeight: 800, color: '#0284c7' }} dir="ltr">{fmt(item.executedQuantity)}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.executedQuantity ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'executedQuantity', e.target.value)}
                        style={{ width: '110px', textAlign: 'center', padding: '0.25rem', border: '1px solid #7dd3fc', borderRadius: '4px', fontWeight: 800, color: '#0284c7', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <span style={{ fontWeight: 800, color: '#334155' }} dir="ltr">{fmt(item.unitRate)}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.unitRate ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'unitRate', e.target.value)}
                        style={{ width: '90px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, color: '#334155', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                    {item.notes || '—'}
                  </td>
                </tr>
              ))}

              {/* Subtotal of Additional Items */}
              <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #cbd5e1' }}>
                <td colSpan={5} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#0f172a', fontSize: '0.92rem' }}>
                  إجمالي البنود الإضافية (خارج العقد):
                </td>
                <td style={{ textAlign: 'center', color: '#0369a1', fontSize: '0.95rem', direction: 'ltr' }}>
                  {fmt(calculations.additionalExecutedSum)} د.ل
                </td>
                <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#b45309' }}>
                  ⚠️ لا تُجمع مع البنود الأساسية
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;

  content = content.replace(
    /\{\/\* تم إلغاء جدول البنود الإضافية لعدم شمولها في التجميع التعاقدي \*\/\}/,
    additionalTableHtml
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched:', filePath);
});
