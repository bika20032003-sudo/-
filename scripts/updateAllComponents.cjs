const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. UPDATE src/components/ExecutiveProgressForm.jsx
// =========================================================================
function updateExecutiveProgressForm() {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'ExecutiveProgressForm.jsx');
  let code = fs.readFileSync(filePath, 'utf8');

  // Add Calculator icon and StationQuantitiesModal import
  if (!code.includes('StationQuantitiesModal')) {
    code = code.replace(
      "import { OfficialPrintModal } from './OfficialPrintModal';",
      `import { OfficialPrintModal } from './OfficialPrintModal';\nimport { StationQuantitiesModal } from './StationQuantitiesModal';\nimport { calculateExecutiveItem, calculateExecutiveTotals, parseCleanNumber, CERTIFIED_RATES } from '../utils/engineeringFormulas.js';`
    );
  }
  if (!code.includes('Calculator,')) {
    code = code.replace('Layers', 'Layers, Calculator');
  }

  // Update initialExecutiveData with certified 29/10/2026 data and unit rates
  const newInitialExecutiveData = `export const initialExecutiveData = {
  projectName: 'مشروع صيانة طريق اوباري غات بطول 360 كيلومتر',
  reportTitle: 'الموقف التنفيذي.',
  contractValue: 897665675.030,
  currency: 'دينار',
  reportDate: '2026-10-29',
  reportNumber: '093436_29.10.2026',
  basicItems: [
    {
      id: 1,
      section: 'أولاً: الدراسة والتصميم',
      itemNumber: '1',
      description: 'دراسة وتصميم كامل القطاع ويشمل العمل حساب حجم المرور وأخذ عينات من الطريق الحالي وتحديد حجم الضرر بالإضافة الى تصميم طبقة الاساس المعدل بطريقة ( FDR ) وتصميم طبقات الرصف التي تليها',
      unit: 'مقطوعية',
      contractQuantity: 1,
      executedQuantity: 0.875,
      remainingQuantity: 0.125,
      unitRate: 17601287.75,
      executedValue: 15401126.78,
      percentage: 87.50,
      notes: ''
    },
    {
      id: 2,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '2',
      description: 'كشط جزء من طبقات الاسفلت والاساس الحبيبي القائم وإعادة تدوير المواد الناتجة من عملية الكشط باستخدام تقنية إعادة تدوير كامل الرصف Full Depth Reclamation FDR ( بعد تعديل خواصها بالإضافات اللازمة ) وفرشها في طبقة جديدة اسفل كأساس لجسم الطريق وتشمل كافة الاختبارات اللازمة لتحديد نسب خلط المواد الإضافية وأسمنت والبودرة واستخدام المعدات الخاصة بالعمل والايادي العاملة واختبارات ضبط الجودة حسب المواصفات الفنية وتعليمات المهندس المشرف.',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2239792.63,
      remainingQuantity: 820207.37,
      unitRate: 119.44,
      executedValue: 267520831.73,
      percentage: 73.20,
      notes: 'محسوبة من أطوال ومساحات المحطات (L41)'
    },
    {
      id: 3,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '3',
      description: 'توريد ورش طبقة تشريب نوع ( MC0 ) بمعدل 1.5 كجم / م2 على السطح النهائي للأساس الحبيبي بعرض واجهة تشمل ثمن المواد وتكاليف النقل ونظافة السطح قبل رشه والآلات والمعدات والأيدي العاملة وكل ما يلزم لنهو العمل والمعتمدة بالمتر المسطح طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2179342.47,
      remainingQuantity: 880657.53,
      unitRate: 13.73,
      executedValue: 29922372.11,
      percentage: 71.22,
      notes: 'محسوبة من أطوال ومساحات المحطات (F37)'
    },
    {
      id: 4,
      section: 'ثانياً: أعمال الرصف',
      itemNumber: '4',
      description: 'توريد وفرش طبقة اسفلتية سطحية محسنة باستخدام البوليمر بسمك 6 سم وبعرض 9.00 م والدك والتسوية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'م2',
      contractQuantity: 3060000.00,
      executedQuantity: 2139464.47,
      remainingQuantity: 920535.53,
      unitRate: 145.35,
      executedValue: 310971160.71,
      percentage: 69.92,
      notes: 'محسوبة من أطوال ومساحات المحطات (R37)'
    },
    {
      id: 5,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '5',
      description: 'تركيب علامات الإرشاد ويشمل هذا البند توريد وتركيب ودعامات لافتات الإرشاد ووضعها في اماكنها وذلك تشمل توريد الاعمدة واللوحات اللازمة وكذلك ثمن المواد والنقل والتوزيع والطلاء العاكس والكتابة وتثبيت العلامات في المواقع المعتمدة بقواعد خرسانية طبقاً للمواصفات الفنية وتعليمات المهندس المشرف',
      unit: 'عدد',
      contractQuantity: 72.00,
      executedQuantity: 0.00,
      remainingQuantity: 72.00,
      unitRate: 1783.99,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    },
    {
      id: 6,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '6',
      description: 'تركيب علامات أرضية لتحديد السرعة ( عواكس أرضية ) وتشمل وضع وحواف الطريق حسب المواصفات الفنية المعمول بها',
      unit: 'عدد',
      contractQuantity: 1080.00,
      executedQuantity: 0.00,
      remainingQuantity: 1080.00,
      unitRate: 135.04,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    },
    {
      id: 7,
      section: 'ثالثاً: الأعمال الإرشادية',
      itemNumber: '7',
      description: 'تركيب السياج المعدني الواقي ويشمل هذا البند إزالة الاسوار المرنة التالفة والاعمدة المتضررة وإبعادها عن حرم الطريق مع توريد وتركيب أسوار مرنة جديدة في الأماكن وتنظيفها حسب المواصفات.',
      unit: 'م.ط',
      contractQuantity: 2160.00,
      executedQuantity: 500.00,
      remainingQuantity: 1660.00,
      unitRate: 1205.23,
      executedValue: 602615.00,
      percentage: 23.15,
      notes: ''
    },
    {
      id: 8,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '8',
      description: 'جلاء سطح الطريق ويشمل هذا البند تنظيف سطح الطريق من الأتربة والمواد العالقة وتوريد طلاء',
      unit: 'م.ط',
      contractQuantity: 720000.00,
      executedQuantity: 402403.00,
      remainingQuantity: 317597.00,
      unitRate: 23.07,
      executedValue: 9283437.21,
      percentage: 55.89,
      notes: ''
    },
    {
      id: 9,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '9',
      description: 'خطوط صفراء على جانبي الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 240000.00,
      executedQuantity: 180646.00,
      remainingQuantity: 59354.00,
      unitRate: 23.07,
      executedValue: 4167503.22,
      percentage: 75.27,
      notes: ''
    },
    {
      id: 10,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '10',
      description: 'خطوط بيضاء متقطعة بمحور الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 120000.00,
      executedQuantity: 19967.00,
      remainingQuantity: 100033.00,
      unitRate: 23.07,
      executedValue: 460638.69,
      percentage: 16.64,
      notes: ''
    },
    {
      id: 11,
      section: 'رابعاً: أعمال الطلاء',
      itemNumber: '11',
      description: 'خطوط بيضاء مستمرة بحواف الطريق بعرض 15 سم',
      unit: 'م.ط',
      contractQuantity: 240000.00,
      executedQuantity: 0.00,
      remainingQuantity: 240000.00,
      unitRate: 23.07,
      executedValue: 0.00,
      percentage: 0.00,
      notes: ''
    }
  ],
  additionalItems: [
    {
      id: 1,
      itemNumber: '1',
      description: 'طبقة أساس حبيبي',
      unit: 'م3',
      contractQuantity: '',
      executedQuantity: 270078.68,
      remainingQuantity: '',
      unitRate: 299.52,
      executedValue: 80893967.36,
      percentage: '',
      notes: 'محسوبة من أطوال ومساحات المحطات بسماكة 12.5 سم (AA44)'
    },
    {
      id: 2,
      itemNumber: '2',
      description: 'الطريق الخدمي',
      unit: 'كيلومتر',
      contractQuantity: '',
      executedQuantity: 225.623,
      remainingQuantity: '',
      unitRate: 59500.00,
      executedValue: 13424568.50,
      percentage: '',
      notes: ''
    }
  ],
  signatories: {
    preparedBy: 'جهاز الإشراف الميداني',
    projectManager: 'م. عبدالرحمن الأنصاري (مدير المشروع)',
    headOfSupervision: 'م. عبدالسلام ابريكاو (رئيس جهاز الإشراف)'
  }
};`;

  code = code.replace(/export const initialExecutiveData = \{[\s\S]*?\n\};/m, newInitialExecutiveData);

  // Update cleanAllItemNumbers to include unitRate
  const oldCleanAll = `contractQuantity: item.contractQuantity !== '' && item.contractQuantity !== null && item.contractQuantity !== undefined ? toCleanLatin(item.contractQuantity) : '',
      executedQuantity: item.executedQuantity !== '' && item.executedQuantity !== null && item.executedQuantity !== undefined ? toCleanLatin(item.executedQuantity) : '',
      remainingQuantity: item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined ? toCleanLatin(item.remainingQuantity) : '',
      executedValue: item.executedValue !== '' && item.executedValue !== null && item.executedValue !== undefined ? toCleanLatin(item.executedValue) : '',
      percentage: item.percentage !== '' && item.percentage !== null && item.percentage !== undefined ? toCleanLatin(item.percentage) : ''`;

  const newCleanAll = `contractQuantity: item.contractQuantity !== '' && item.contractQuantity !== null && item.contractQuantity !== undefined ? toCleanLatin(item.contractQuantity) : '',
      executedQuantity: item.executedQuantity !== '' && item.executedQuantity !== null && item.executedQuantity !== undefined ? toCleanLatin(item.executedQuantity) : '',
      remainingQuantity: item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined ? toCleanLatin(item.remainingQuantity) : '',
      unitRate: item.unitRate !== '' && item.unitRate !== null && item.unitRate !== undefined ? toCleanLatin(item.unitRate) : '',
      executedValue: item.executedValue !== '' && item.executedValue !== null && item.executedValue !== undefined ? toCleanLatin(item.executedValue) : '',
      percentage: item.percentage !== '' && item.percentage !== null && item.percentage !== undefined ? toCleanLatin(item.percentage) : ''`;

  code = code.replace(oldCleanAll, newCleanAll);

  // Auto calculate executedValue = executedQuantity * unitRate in handleBasicItemChange
  const oldBasicChange = `// Auto compute remaining & percentage when contractQuantity or executedQuantity changes
      if (field === 'contractQuantity' || field === 'executedQuantity') {
        const cQ = field === 'contractQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.contractQuantity));
        const eQ = field === 'executedQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.executedQuantity));
        if (!isNaN(cQ) && !isNaN(eQ)) {
          item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(2)));
          if (cQ > 0) {
            item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
          }
        }
      }`;

  const newBasicChange = `// Auto compute remaining, executedValue & percentage based on official Excel formulas
      if (field === 'contractQuantity' || field === 'executedQuantity' || field === 'unitRate') {
        const cQ = field === 'contractQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.contractQuantity));
        const eQ = field === 'executedQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.executedQuantity));
        const rate = field === 'unitRate' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.unitRate));
        if (!isNaN(cQ) && !isNaN(eQ)) {
          item.remainingQuantity = String(parseFloat(Math.max(0, cQ - eQ).toFixed(2)));
          if (cQ > 0) {
            item.percentage = String(parseFloat(((eQ / cQ) * 100).toFixed(2)));
          }
        }
        if (!isNaN(eQ) && !isNaN(rate)) {
          item.executedValue = String(parseFloat((eQ * rate).toFixed(2)));
        }
      }`;

  code = code.replace(oldBasicChange, newBasicChange);

  // Auto calculate executedValue in handleAdditionalItemChange
  const oldAddChange = `const handleAdditionalItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.additionalItems];
      updated[idx] = { ...updated[idx], [field]: cleanVal };
      return { ...prev, additionalItems: updated };
    });
  };`;

  const newAddChange = `const handleAdditionalItemChange = (idx, field, val) => {
    const cleanVal = toCleanLatin(val);
    setData(prev => {
      const updated = [...prev.additionalItems];
      const item = { ...updated[idx], [field]: cleanVal };
      if (field === 'executedQuantity' || field === 'unitRate') {
        const eQ = field === 'executedQuantity' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.executedQuantity));
        const rate = field === 'unitRate' ? parseFloat(cleanVal) : parseFloat(toCleanLatin(item.unitRate));
        if (!isNaN(eQ) && !isNaN(rate)) {
          item.executedValue = String(parseFloat((eQ * rate).toFixed(2)));
        }
      }
      updated[idx] = item;
      return { ...prev, additionalItems: updated };
    });
  };`;

  code = code.replace(oldAddChange, newAddChange);

  // Add state showStationModal
  if (!code.includes('const [showStationModal, setShowStationModal] = useState(false);')) {
    code = code.replace(
      'const [showPrintModal, setShowPrintModal] = useState(false);',
      'const [showPrintModal, setShowPrintModal] = useState(false);\n  const [showStationModal, setShowStationModal] = useState(false);'
    );
  }

  // Add handler to apply station totals into executive progress form
  if (!code.includes('handleApplyStationTotals')) {
    const applyStationFn = `
  // Sync quantities directly from Station Quantities Calculator (Excel Sheet 29/10/2026)
  const handleApplyStationTotals = (stationTotals) => {
    if (!stationTotals) return;
    setData(prev => {
      const updatedBasic = prev.basicItems.map(item => {
        // FDR (Item 2) -> L41 (Area: 2,239,792.63 m2)
        if (item.id === 2 || item.itemNumber === '2') {
          const eQ = stationTotals.fdr?.area || 2239792.63;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 119.44;
          const cQ = parseFloat(toCleanLatin(item.contractQuantity)) || 3060000;
          return {
            ...item,
            executedQuantity: String(eQ),
            remainingQuantity: String(parseFloat(Math.max(0, cQ - eQ).toFixed(2))),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            percentage: String(parseFloat(((eQ / cQ) * 100).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (L41)'
          };
        }
        // MCO (Item 3) -> F37 (Area: 2,179,342.47 m2)
        if (item.id === 3 || item.itemNumber === '3') {
          const eQ = stationTotals.mco?.area || 2179342.47;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 13.73;
          const cQ = parseFloat(toCleanLatin(item.contractQuantity)) || 3060000;
          return {
            ...item,
            executedQuantity: String(eQ),
            remainingQuantity: String(parseFloat(Math.max(0, cQ - eQ).toFixed(2))),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            percentage: String(parseFloat(((eQ / cQ) * 100).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (F37)'
          };
        }
        // Asphalt (Item 4) -> R37 (Area: 2,139,464.47 m2)
        if (item.id === 4 || item.itemNumber === '4') {
          const eQ = stationTotals.asphalt?.area || 2139464.47;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 145.35;
          const cQ = parseFloat(toCleanLatin(item.contractQuantity)) || 3060000;
          return {
            ...item,
            executedQuantity: String(eQ),
            remainingQuantity: String(parseFloat(Math.max(0, cQ - eQ).toFixed(2))),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            percentage: String(parseFloat(((eQ / cQ) * 100).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (R37)'
          };
        }
        return item;
      });

      const updatedAdd = prev.additionalItems.map(item => {
        // Base Course Volume (Item 1) -> AA44 (Volume: 270,078.68 m3)
        if (item.id === 1 || item.itemNumber === '1') {
          const eQ = stationTotals.base?.volume || 270078.68;
          const rate = parseFloat(toCleanLatin(item.unitRate)) || 299.52;
          return {
            ...item,
            executedQuantity: String(eQ),
            executedValue: String(parseFloat((eQ * rate).toFixed(2))),
            notes: 'محسوبة تلقائياً من حاسبة المحطات (AA44)'
          };
        }
        return item;
      });

      setStatusMessage({ type: 'success', text: 'تم تطبيق كميات المحطات الرسمية (FDR، MCO، الأسفلت، الأساس) وإعادة حساب القيم بدقة الإكسل!' });
      return {
        ...prev,
        basicItems: updatedBasic,
        additionalItems: updatedAdd
      };
    });
  };
`;
    code = code.replace('const handleHeaderChange =', applyStationFn + '\n  const handleHeaderChange =');
  }

  // Add Station Calculator button in Top Header Action Buttons
  const stationBtn = `
          <button
            type="button"
            onClick={() => setShowStationModal(true)}
            style={{
              background: '#f8fafc',
              color: '#0369a1',
              border: '1.5px solid #0284c7',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.12)'
            }}
            title="فتح حاسبة محطات طبقات الرصف الرسمية (FDR، MCO، أسفلت، أساس)"
          >
            <Calculator size={16} color="#0284c7" />
            <span>حاسبة محطات الرصف</span>
          </button>
`;
  if (!code.includes('حاسبة محطات الرصف')) {
    code = code.replace('<button\n            type="button"\n            onClick={handleExportExcel}', stationBtn + '\n          <button\n            type="button"\n            onClick={handleExportExcel}');
  }

  // Add الفئة column to Basic Items table header
  const oldBasicHeader = `<th style={{ width: '110px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المتبقي</th>
                <th style={{ width: '140px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>`;
  const newBasicHeader = `<th style={{ width: '110px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المتبقي</th>
                <th style={{ width: '100px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الفئة (د.ل)</th>
                <th style={{ width: '140px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>`;
  code = code.replace(oldBasicHeader, newBasicHeader);

  // Update section banner colSpan from 8/9 to 9/10
  code = code.replace('colSpan={readOnlyMode ? 8 : 9}', 'colSpan={readOnlyMode ? 9 : 10}');

  // Add الفئة input to Basic Items row
  const oldBasicRowCell = `<td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.executedValue ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'executedValue', e.target.value)}
                            style={{ width: '125px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 900, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>`;

  const newBasicRowCell = `<td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <span style={{ fontWeight: 800, color: '#1e40af' }} dir="ltr">{fmt(item.unitRate)}</span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.unitRate ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'unitRate', e.target.value)}
                            style={{ width: '90px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, color: '#1e40af', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {readOnlyMode ? (
                          <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            lang="en-US"
                            dir="ltr"
                            value={toCleanLatin(item.executedValue ?? '')}
                            onChange={(e) => handleBasicItemChange(idx, 'executedValue', e.target.value)}
                            style={{ width: '125px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 900, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                          />
                        )}
                      </td>`;

  code = code.replace(oldBasicRowCell, newBasicRowCell);

  // Update Basic Subtotal colSpan from 6 to 7
  code = code.replace(
    '<td colSpan={6} style={{ padding: \'0.75rem 1rem\', textAlign: \'left\', color: \'#0f172a\', fontSize: \'0.92rem\' }}>',
    '<td colSpan={7} style={{ padding: \'0.75rem 1rem\', textAlign: \'left\', color: \'#0f172a\', fontSize: \'0.92rem\' }}>'
  );

  // Add الفئة column to Additional Items table header
  const oldAddHeader = `<th style={{ width: '130px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المنفذ</th>
                <th style={{ width: '160px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>`;
  const newAddHeader = `<th style={{ width: '130px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>المنفذ</th>
                <th style={{ width: '110px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>الفئة (د.ل)</th>
                <th style={{ width: '160px', textAlign: 'center', padding: '0.6rem 0.4rem' }}>قيمة المنفذ (د.ل)</th>`;
  code = code.replace(oldAddHeader, newAddHeader);

  // Add الفئة input to Additional Items row
  const oldAddRowCell = `<td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.executedValue ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'executedValue', e.target.value)}
                        style={{ width: '140px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 900, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>`;

  const newAddRowCell = `<td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <span style={{ fontWeight: 800, color: '#1e40af' }} dir="ltr">{fmt(item.unitRate)}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.unitRate ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'unitRate', e.target.value)}
                        style={{ width: '100px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, color: '#1e40af', direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {readOnlyMode ? (
                      <strong style={{ color: '#0f172a' }} dir="ltr">{fmt(item.executedValue)}</strong>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        lang="en-US"
                        dir="ltr"
                        value={toCleanLatin(item.executedValue ?? '')}
                        onChange={(e) => handleAdditionalItemChange(idx, 'executedValue', e.target.value)}
                        style={{ width: '140px', textAlign: 'center', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 900, direction: 'ltr', fontFamily: "'Segoe UI', Roboto, Tahoma, Arial, sans-serif" }}
                      />
                    )}
                  </td>`;
  code = code.replace(oldAddRowCell, newAddRowCell);

  // Update Additional Subtotal colSpan from 4 to 5
  code = code.replace(
    '<td colSpan={4} style={{ padding: \'0.75rem 1rem\', textAlign: \'left\', color: \'#0f172a\', fontSize: \'0.92rem\' }}>\n                  إجمالي البنود الإضافية:',
    '<td colSpan={5} style={{ padding: \'0.75rem 1rem\', textAlign: \'left\', color: \'#0f172a\', fontSize: \'0.92rem\' }}>\n                  إجمالي البنود الإضافية:'
  );

  // Mount StationQuantitiesModal JSX before closing div
  if (!code.includes('<StationQuantitiesModal')) {
    code = code.replace(
      '{showPrintModal && (',
      `<StationQuantitiesModal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        onApplyTotals={handleApplyStationTotals}
      />\n\n      {showPrintModal && (`
    );
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Updated src/components/ExecutiveProgressForm.jsx');
}

// =========================================================================
// 2. UPDATE src/components/OfficialPrintModal.jsx
// =========================================================================
function updateOfficialPrintModal() {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'OfficialPrintModal.jsx');
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix print CSS rules to permanently prevent 2nd blank page
  const oldPrintBlock = `          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .official-print-modal-overlay {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .print-sheet-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
            display: block !important;
          }
          .official-print-document,
          .official-print-document.landscape-mode {
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            box-sizing: border-box !important;
            zoom: 1 !important;
            transform: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }`;

  const newPrintBlock = `          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          #root {
            display: none !important;
            min-height: 0 !important;
            height: 0 !important;
          }
          .official-print-modal-overlay {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .print-sheet-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
          }
          .official-print-document,
          .official-print-document.landscape-mode {
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            box-sizing: border-box !important;
            zoom: 1 !important;
            transform: none !important;
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .official-print-document > *:last-child,
          .official-print-document div:last-child {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }`;

  code = code.replace(oldPrintBlock, newPrintBlock);

  // Add الفئة column to Executive Progress Report print table
  const oldPrintExecHeader = `<th style={{ border: '1px solid #000000', padding: '5px 3px', width: '92px', fontWeight: 900 }}>المتبقي</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '120px', fontWeight: 900 }}>قيمة المنفذ</th>`;
  const newPrintExecHeader = `<th style={{ border: '1px solid #000000', padding: '5px 3px', width: '92px', fontWeight: 900 }}>المتبقي</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '85px', fontWeight: 900 }}>الفئة (د.ل)</th>
                    <th style={{ border: '1px solid #000000', padding: '5px 3px', width: '120px', fontWeight: 900 }}>قيمة المنفذ</th>`;
  code = code.replace(oldPrintExecHeader, newPrintExecHeader);

  // Update section banner colSpan in print table
  code = code.replace(
    '<td colSpan={8} style={{ border: \'1px solid #000000\', padding: \'4px 8px\', textAlign: \'right\', fontSize: \'0.82rem\' }}>\n                      بنود أساسية',
    '<td colSpan={9} style={{ border: \'1px solid #000000\', padding: \'4px 8px\', textAlign: \'right\', fontSize: \'0.82rem\' }}>\n                      بنود أساسية'
  );
  code = code.replace(
    '<td colSpan={8} style={{ border: \'1px solid #000000\', padding: \'3px 8px\', textAlign: \'right\', fontSize: \'0.8rem\' }}>\n                              {item.section}',
    '<td colSpan={9} style={{ border: \'1px solid #000000\', padding: \'3px 8px\', textAlign: \'right\', fontSize: \'0.8rem\' }}>\n                              {item.section}'
  );

  // Add unitRate cell to basic items in print table
  const oldBasicPrintCell = `<td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 700, color: '#9a3412' }} dir="ltr">
                            {item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined && Number(item.remainingQuantity) > 0 ? fmtNum(item.remainingQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">`;

  const newBasicPrintCell = `<td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 700, color: '#9a3412' }} dir="ltr">
                            {item.remainingQuantity !== '' && item.remainingQuantity !== null && item.remainingQuantity !== undefined && Number(item.remainingQuantity) > 0 ? fmtNum(item.remainingQuantity) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 800 }} dir="ltr">
                            {item.unitRate !== '' && item.unitRate !== null && item.unitRate !== undefined ? fmtNum(item.unitRate) : '—'}
                          </td>
                          <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">`;
  code = code.replace(oldBasicPrintCell, newBasicPrintCell);

  // Update basic subtotal colSpan in print table from 6 to 7
  code = code.replace(
    '<td colSpan={6} style={{ border: \'1px solid #000000\', padding: \'5px 10px\', textAlign: \'left\', fontSize: \'0.85rem\' }}>\n                      إجمالي البنود الأساسية',
    '<td colSpan={7} style={{ border: \'1px solid #000000\', padding: \'5px 10px\', textAlign: \'left\', fontSize: \'0.85rem\' }}>\n                      إجمالي البنود الأساسية'
  );

  // Update additional banner colSpan in print table from 8 to 9
  code = code.replace(
    '<td colSpan={8} style={{ border: \'1px solid #000000\', padding: \'4px 8px\', textAlign: \'right\', fontSize: \'0.82rem\' }}>\n                      بنود إضافية',
    '<td colSpan={9} style={{ border: \'1px solid #000000\', padding: \'4px 8px\', textAlign: \'right\', fontSize: \'0.82rem\' }}>\n                      بنود إضافية'
  );

  // Add unitRate cell to additional items in print table
  const oldAddPrintCell = `<td style={{ border: '1px solid #000000', padding: '3px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">
                        {fmtNum(item.executedValue)}
                      </td>`;

  const newAddPrintCell = `<td style={{ border: '1px solid #000000', padding: '3px', color: '#64748b' }}>—</td>
                      <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 800 }} dir="ltr">
                        {item.unitRate !== '' && item.unitRate !== null && item.unitRate !== undefined ? fmtNum(item.unitRate) : '—'}
                      </td>
                      <td style={{ border: '1px solid #000000', padding: '3px', fontWeight: 900 }} dir="ltr">
                        {fmtNum(item.executedValue)}
                      </td>`;
  code = code.replace(oldAddPrintCell, newAddPrintCell);

  // Update additional subtotal colSpan in print table from 6 to 7
  code = code.replace(
    '<td colSpan={6} style={{ border: \'1px solid #000000\', padding: \'5px 10px\', textAlign: \'left\', fontSize: \'0.85rem\' }}>\n                      إجمالي البنود الإضافية',
    '<td colSpan={7} style={{ border: \'1px solid #000000\', padding: \'5px 10px\', textAlign: \'left\', fontSize: \'0.85rem\' }}>\n                      إجمالي البنود الإضافية'
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Updated src/components/OfficialPrintModal.jsx');
}

// =========================================================================
// 3. UPDATE src/components/TwoPhaseDailyReportForm.jsx
// =========================================================================
function updateTwoPhaseDailyReportForm() {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'TwoPhaseDailyReportForm.jsx');
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace initialPhase1ReportItems with updated 29/10/2026
  const newP1 = `export const initialPhase1ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '0', totalMeters: '226083', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '226213', dailyTarget: '800', varianceMeters: '—', notes: 'مكتملة بالكامل بالمرحلة الأولى', color: '#eab308', shortName: 'طريق خدمي' },
];`;

  const newP2 = `export const initialPhase2ReportItems = [
  { id: 1, category: 'basic', name: 'طبقة إعادة التدوير (FDR)', todayMeters: '100', totalMeters: '19300', dailyTarget: '800', varianceMeters: '-700.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#16a34a', shortName: 'إعادة تدوير' },
  { id: 2, category: 'basic', name: 'رش طبقة التشريب (MCO)', todayMeters: '1150', totalMeters: '12520', dailyTarget: '800', varianceMeters: '350.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0284c7', shortName: 'رش تشريب' },
  { id: 3, category: 'basic', name: 'طبقة الاسفلت المحسن', todayMeters: '0', totalMeters: '10290', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#0f172a', shortName: 'اسفلت محسن' },
  { id: 4, category: 'additional', name: 'فرمة اولي بدون اسمنت(FDR)', todayMeters: '0', totalMeters: '19320', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#22c55e', shortName: 'فرم بدون أسمنت' },
  { id: 5, category: 'additional', name: 'طبقة أساس حبيبي', todayMeters: '600', totalMeters: '12630', dailyTarget: '800', varianceMeters: '-200.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#ea580c', shortName: 'أساس حبيبي' },
  { id: 6, category: 'additional', name: 'الطريق الخدمي', todayMeters: '0', totalMeters: '19320', dailyTarget: '800', varianceMeters: '-800.00', notes: 'منجز معتمد بالتقرير اليومي', color: '#eab308', shortName: 'طريق خدمي' },
];`;

  const newCombinedCustom = `export const initialCombinedCustomFields = [
  { id: 1, readyToWorkMeters: '20.00', notes: 'الجاهز للعمل بالبند (منفذ فرمة اولي وغير منفذ فرمة تانية)' },
  { id: 2, readyToWorkMeters: '110.00', notes: 'الجاهز للعمل بالبند (منفذ اساس وغير مرشوش mc)' },
  { id: 3, readyToWorkMeters: '2230.00', notes: 'الجاهز للعمل بالبند (مرشوش mc وغير منفذ اسفلت)' },
  { id: 4, readyToWorkMeters: '', notes: '' },
  { id: 5, readyToWorkMeters: '6670.00', notes: 'الجاهز للعمل بالبند (منفذ فرمة ثانية وغير منفذ اساس)' },
  { id: 6, readyToWorkMeters: '', notes: '' },
];`;

  const newRemaining = `export const initialRemainingReportItems = [
  { id: 1, group: 'A', name: 'المتبقي من الفرمة الأولى', phase1: '130.00', phase2: '114467.00', total: '114597.00', notes: 'جزء العبارة المنهارة' },
  { id: 2, group: 'A', name: 'المتبقي من الفرمة الثانية', phase1: '130.00', phase2: '114487.00', total: '114617.00', notes: 'جزء العبارة المنهارة' },
  { id: 3, group: 'A', name: 'المتبقي من الأساس', phase1: '130.00', phase2: '121157.00', total: '121287.00', notes: '' },
  { id: 4, group: 'B', name: 'المتبقي من طبقة التشريب', phase1: '130.00', phase2: '121267.00', total: '121397.00', notes: '' },
  { id: 5, group: 'B', name: 'المتبقي من الاسفلت', phase1: '130.00', phase2: '123497.00', total: '123627.00', notes: '' },
  { id: 6, group: 'B', name: 'طول الطريق الخدمي العامل', phase1: '', phase2: '', total: '9030.00', notes: 'كيلومتر' },
];`;

  code = code.replace(/export const initialPhase1ReportItems = \[[\s\S]*?\];/m, newP1);
  code = code.replace(/export const initialPhase2ReportItems = \[[\s\S]*?\];/m, newP2);
  code = code.replace(/export const initialCombinedCustomFields = \[[\s\S]*?\];/m, newCombinedCustom);
  code = code.replace(/export const initialRemainingReportItems = \[[\s\S]*?\];/m, newRemaining);

  // Update default header states
  code = code.replace("useState('2026-10-24')", "useState('2026-10-29')");
  code = code.replace("useState('السبت')", "useState('الخميس')");
  code = code.replace("useState('082024_24.10.2026')", "useState('082024_29.10.2026')");

  // Import calculateReadyToWorkPipeline & calculateRemainingItems
  if (!code.includes('calculateReadyToWorkPipeline')) {
    code = code.replace(
      "import { toCleanLatinDigits } from '../utils/forceLatinDigits.js';",
      `import { toCleanLatinDigits } from '../utils/forceLatinDigits.js';\nimport { calculateReadyToWorkPipeline, calculateRemainingItems } from '../utils/engineeringFormulas.js';`
    );
  }

  // Add auto-pipeline calculation function and trigger button
  if (!code.includes('handleAutoCalculatePipeline')) {
    const pipelineFn = `
  // Auto-calculate construction pipeline (الجاهز للعمل في البند) & Remaining according to certified Excel engineering rules
  const handleAutoCalculatePipeline = () => {
    // 1. Gather combined totals for pipeline
    const totalsMap = {};
    phase1Items.forEach((p1, idx) => {
      const p2 = phase2Items[idx] || {};
      const t1 = parseFloat(toCleanLatinDigits(p1.totalMeters)) || 0;
      const t2 = parseFloat(toCleanLatinDigits(p2.totalMeters)) || 0;
      totalsMap[p1.name] = t1 + t2;
    });

    const pipeline = calculateReadyToWorkPipeline(totalsMap);

    // Update combinedCustom
    setCombinedCustom(prev => prev.map(c => {
      if (c.id === 1) return { ...c, readyToWorkMeters: String(pipeline.fdrReady), notes: 'الجاهز للعمل بالبند (منفذ فرمة اولي وغير منفذ فرمة تانية)' };
      if (c.id === 2) return { ...c, readyToWorkMeters: String(pipeline.mcoReady), notes: 'الجاهز للعمل بالبند (منفذ اساس وغير مرشوش mc)' };
      if (c.id === 3) return { ...c, readyToWorkMeters: String(pipeline.asphaltReady), notes: 'الجاهز للعمل بالبند (مرشوش mc وغير منفذ اسفلت)' };
      if (c.id === 5) return { ...c, readyToWorkMeters: String(pipeline.baseReady), notes: 'الجاهز للعمل بالبند (منفذ فرمة ثانية وغير منفذ اساس)' };
      return c;
    }));

    // 2. Auto calculate remaining
    const p2Map = {};
    phase2Items.forEach(p2 => {
      p2Map[p2.name] = parseFloat(toCleanLatinDigits(p2.totalMeters)) || 0;
    });
    const calculatedRemaining = calculateRemainingItems(p2Map);
    setRemainingItems(calculatedRemaining);
  };
`;
    code = code.replace('const handleRestoreCertifiedData = () => {', pipelineFn + '\n  const handleRestoreCertifiedData = () => {');
  }

  // Update restore handler values
  code = code.replace(
    "setReportDate('2026-10-24');\n    setDayName('السبت');",
    "setReportDate('2026-10-29');\n    setDayName('الخميس');\n    setReportNumber('082024_29.10.2026');"
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Updated src/components/TwoPhaseDailyReportForm.jsx');
}

// =========================================================================
// 4. UPDATE src/views/RoadProgressView.jsx
// =========================================================================
function updateRoadProgressView() {
  const filePath = path.join(__dirname, '..', 'src', 'views', 'RoadProgressView.jsx');
  let code = fs.readFileSync(filePath, 'utf8');

  // Add Calculator icon & StationQuantitiesModal
  if (!code.includes('StationQuantitiesModal')) {
    code = code.replace(
      "import { TwoPhaseDailyReportForm } from '../components/TwoPhaseDailyReportForm';",
      `import { TwoPhaseDailyReportForm } from '../components/TwoPhaseDailyReportForm';\nimport { StationQuantitiesModal } from '../components/StationQuantitiesModal';\nimport { Calculator } from 'lucide-react';`
    );
  }

  // Add state for Station Modal
  if (!code.includes('showStationModal')) {
    code = code.replace(
      "const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);",
      "const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);\n    const [showStationModal, setShowStationModal] = useState(false);"
    );
  }

  // Add Button in Action Header
  const calcBtn = `
                    <button
                        onClick={() => setShowStationModal(true)}
                        className="btn-custom"
                        style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                        }}
                        title="فتح حاسبة محطات طبقات الرصف لحساب أطوال ومساحات وأحجام FDR و MCO والأسفلت والأساس"
                    >
                        <Calculator size={16} />
                        <span>حاسبة محطات الرصف</span>
                    </button>
`;
  if (!code.includes('حاسبة محطات الرصف')) {
    code = code.replace('<button\n                        onClick={fetchProgressReports}', calcBtn + '\n                    <button\n                        onClick={fetchProgressReports}');
  }

  // Mount StationQuantitiesModal before end of component
  if (!code.includes('<StationQuantitiesModal')) {
    code = code.replace(
      '{selectedReportForPrint && (',
      `<StationQuantitiesModal
                isOpen={showStationModal}
                onClose={() => setShowStationModal(false)}
            />\n\n            {selectedReportForPrint && (`
    );
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Updated src/views/RoadProgressView.jsx');
}

// =========================================================================
// 5. MIRROR ALL CHANGES TO منظومة جهاز الاشراف/src/
// =========================================================================
function mirrorToOtherDirectory() {
  const targetRoot = path.join(__dirname, '..', 'منظومة جهاز الاشراف', 'src');
  if (!fs.existsSync(targetRoot)) {
    console.log('Mirror directory does not exist, skipping mirror.');
    return;
  }

  const filesToMirror = [
    ['utils', 'engineeringFormulas.js'],
    ['utils', 'twoPhaseSync.js'],
    ['components', 'ExecutiveProgressForm.jsx'],
    ['components', 'OfficialPrintModal.jsx'],
    ['components', 'StationQuantitiesModal.jsx'],
    ['components', 'TwoPhaseDailyReportForm.jsx'],
    ['views', 'RoadProgressView.jsx'],
    ['index.css']
  ];

  filesToMirror.forEach(pair => {
    const srcFile = path.join(__dirname, '..', 'src', ...pair);
    const destFile = path.join(targetRoot, ...pair);
    if (fs.existsSync(srcFile)) {
      const destDir = path.dirname(destFile);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcFile, destFile);
      console.log('Mirrored:', pair.join('/'));
    }
  });
}

// EXECUTE ALL
try {
  updateExecutiveProgressForm();
  updateOfficialPrintModal();
  updateTwoPhaseDailyReportForm();
  updateRoadProgressView();
  mirrorToOtherDirectory();
  console.log('=== All components successfully updated and mirrored! ===');
} catch (e) {
  console.error('Error during component updates:', e);
  process.exit(1);
}
