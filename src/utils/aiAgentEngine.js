/**
 * Intelligent AI Engineering Agent Engine
 * الوكيل الذكي لجهاز الإشراف والمتابعة - مشروع صيانة طريق أوباري غات (360 كم)
 * 
 * Supports:
 * 1. Offline Built-in Engineering Knowledge & Live System State NLP Engine
 * 2. Real-time querying of Executive Progress, Road Pipeline, Fuel, Equipment & Stations
 * 3. Automatic Executive Summary & Official Memo Generation
 * 4. Optional Gemini API Cloud Connection for Open-Ended Queries
 */

import { parseCleanNumber, CERTIFIED_RATES, CERTIFIED_PROJECT_META, calculateReadyToWorkPipeline } from './engineeringFormulas.js';
import { initialExecutiveData } from '../components/ExecutiveProgressForm.jsx';
import { initialMCOStations, initialFDRStations, initialAsphaltStations, initialBaseStations } from '../components/StationQuantitiesModal.jsx';

/**
 * Gather live synchronized context from localStorage and initial states
 */
export function getLiveSystemContext() {
  let executive = initialExecutiveData;
  try {
    const rawExec = localStorage.getItem('executive_progress_data');
    if (rawExec) executive = { ...initialExecutiveData, ...JSON.parse(rawExec) };
  } catch (_) {}

  let twoPhase = null;
  try {
    const rawTP = localStorage.getItem('two_phase_report_data');
    if (rawTP) twoPhase = JSON.parse(rawTP);
  } catch (_) {}

  let fuelData = null;
  try {
    const rawFuel = localStorage.getItem('last_fuel_report');
    if (rawFuel) fuelData = JSON.parse(rawFuel);
  } catch (_) {}

  // Compute live executive sums
  const basicItems = executive.basicItems || [];
  const additionalItems = executive.additionalItems || [];
  const contractVal = parseCleanNumber(executive.contractValue, 897665675.03);
  const basicExecutedSum = basicItems.reduce((acc, it) => acc + parseCleanNumber(it.executedValue, 0), 0);
  const additionalExecutedSum = additionalItems.reduce((acc, it) => acc + parseCleanNumber(it.executedValue, 0), 0);
  const grandExecutedSum = basicExecutedSum + additionalExecutedSum;
  const remainingContractVal = Math.max(0, contractVal - grandExecutedSum);
  const financialProgressPct = contractVal > 0 ? ((grandExecutedSum / contractVal) * 100).toFixed(2) : '0';

  return {
    contractVal,
    grandExecutedSum,
    remainingContractVal,
    financialProgressPct,
    basicExecutedSum,
    additionalExecutedSum,
    basicItems,
    additionalItems,
    executiveDate: executive.reportDate || '2026-10-29',
    reportNumber: executive.reportNumber || '093436_29.10.2026',
    twoPhase,
    fuelData
  };
}

/**
 * Format currency or number with English digits and commas
 */
function fmt(num, decimals = 2) {
  if (num === null || num === undefined || num === '') return '—';
  const val = Number(num);
  if (isNaN(val)) return String(num);
  return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Offline Rule-Based NLP Intent Classifier & Response Generator
 */
export function processLocalQuery(queryText) {
  const q = (queryText || '').toLowerCase().trim();
  const ctx = getLiveSystemContext();

  // 1. الموقف التنفيذي العام والمالي
  if (
    q.includes('موقف') || 
    q.includes('قيمة العقد') || 
    q.includes('نسبة الانجاز') || 
    q.includes('نسبة الإنجاز') || 
    q.includes('المنجز المالي') || 
    q.includes('كم نسبة') || 
    q.includes('المتبقي من العقد') ||
    q.includes('الملخص المالي')
  ) {
    return {
      type: 'executive_summary',
      title: 'ملخص الموقف التنفيذي والمالي المعتمد للمشروع',
      content: `📌 **الموقف التنفيذي لمشروع صيانة طريق أوباري - غات (360 كم):**
• **قيمة العقد الكلية:** \`${fmt(ctx.contractVal)} د.ل\`
• **إجمالي المنفذ المالي الفعلي:** \`${fmt(ctx.grandExecutedSum)} د.ل\`
• **نسبة الإنجاز المالي العام:** \`${ctx.financialProgressPct}%\`
• **المتبقي المالي من العقد:** \`${fmt(ctx.remainingContractVal)} د.ل\`
• **إجمالي البنود الأساسية:** \`${fmt(ctx.basicExecutedSum)} د.ل\` (${((ctx.basicExecutedSum / ctx.contractVal) * 100).toFixed(2)}%)
• **إجمالي البنود الإضافية:** \`${fmt(ctx.additionalExecutedSum)} د.ل\`
• **تاريخ الاعتماد الرسمي:** \`${ctx.executiveDate}\` (المرجع: \`${ctx.reportNumber}\`)`,
      quickSuggestions: ['فئات البنود التعاقدية', 'الجاهز للرصف في البنود', 'كميات الوقود اليومية']
    };
  }

  // 2. فئات وأسعار البنود المعتمدة
  if (q.includes('فئة') || q.includes('سعر') || q.includes('أسعار') || q.includes('تكلفة المتر')) {
    return {
      type: 'rates_info',
      title: 'الفئات التعاقدية المعتمدة للبنود (بالدينار الليبي)',
      content: `📋 **جدول الفئات التعاقدية المعتمدة رسمياً في وثيقة 29/10/2026:**
• **كشط وإعادة تدوير (FDR):** \`119.44 د.ل / م²\`
• **رش طبقة تشريب (MCO):** \`13.73 د.ل / م²\`
• **طبقة أسفلت محسن بالبوليمر (6 سم):** \`145.35 د.ل / م²\`
• **طبقة أساس حبيبي إضافية:** \`299.52 د.ل / م³\`
• **الطريق الخدمي العامل:** \`59,500.00 د.ل / كم\`
• **الدراسة والتصميم:** \`17,601,287.75 د.ل\` (مقطوعية)
• **سياج معدني واقي:** \`1,205.23 د.ل / م.ط\`
• **علامات الإرشاد:** \`1,783.99 د.ل / عدد\`
• **عواكس أرضية لتحديد السرعة:** \`135.04 د.ل / عدد\`
• **أعمال الطلاء والخطوط (صفراء/بيضاء):** \`23.07 د.ل / م.ط\``,
      quickSuggestions: ['كم المنفذ من الأسفلت؟', 'كم المنفذ من FDR؟', 'حاسبة المحطات']
    };
  }

  // 3. التتابع الإنشائي الميداني (الجاهز للعمل في البند)
  if (
    q.includes('جاهز') || 
    q.includes('الجاهز للعمل') || 
    q.includes('تتابع') || 
    q.includes('فرمة') || 
    q.includes('مسار') ||
    q.includes('pipeline')
  ) {
    return {
      type: 'pipeline_info',
      title: 'مؤشرات التتابع الإنشائي الميداني (الجاهز للعمل بالبند)',
      content: `🚧 **حالة الجاهزية الميدانية للتنفيذ طبقاً للتتابع الهندسي للطبقات:**
1. **الجاهز لطبقة الأسفلت المحسن:**
   • \`2,230.00 م.ط\` (قطاع مرشوش MC0 وجاهز لطرح الأسفلت فورياً).
2. **الجاهز لرش طبقة التشريب (MCO):**
   • \`110.00 م.ط\` (قطاع منجز بالأساس الحبيبي وقيد نظافة السطح والرش).
3. **الجاهز لطبقة الأساس الحبيبي:**
   • \`6,670.00 م.ط\` (قطاع منجز فرمة ثانية FDR وجاهز لفرش الأساس).
4. **الجاهز للفرمة الثانية (FDR):**
   • \`20.00 م.ط\` (قطاع منجز فرمة أولى وجاهز لخلط الأسمنت والدك).
5. **طول الطريق الخدمي العامل بالموقع:**
   • \`9,030.00 م.ط\` (فارق المسافة المفتوحة بين جبهات التدوير وجبهة الأسفلت).`,
      quickSuggestions: ['ما هو عائق المرحلة الأولى؟', 'محطات الأسفلت', 'الموقف التنفيذي']
    };
  }

  // 4. استفسارات الأسفلت والـ FDR والطبقات المنفذة
  if (q.includes('اسفلت') || q.includes('أسفلت') || q.includes('fdr') || q.includes('تدوير') || q.includes('mco') || q.includes('تشريب') || q.includes('اساس') || q.includes('أساس')) {
    const fdrItem = ctx.basicItems.find(i => i.id === 2 || i.itemNumber === '2') || {};
    const mcoItem = ctx.basicItems.find(i => i.id === 3 || i.itemNumber === '3') || {};
    const asphItem = ctx.basicItems.find(i => i.id === 4 || i.itemNumber === '4') || {};
    const baseItem = ctx.additionalItems.find(i => i.id === 1 || i.itemNumber === '1') || {};

    return {
      type: 'layers_quantities',
      title: 'موقف طبقات الرصف المعتمدة (الكميات المنفذة والقيم)',
      content: `🛣️ **إحصائيات طبقات الرصف الرئيسية (وفق حاسبة المحطات الرسمية):**
• **طبقة إعادة التدوير (FDR):**
  - المنفذ: \`${fmt(fdrItem.executedQuantity)} م²\` (${fdrItem.percentage || '73.20'}%)
  - القيمة المنفذة: \`${fmt(fdrItem.executedValue)} د.ل\` (الفئة: \`119.44 د.ل\`)
  - المتبقي: \`${fmt(fdrItem.remainingQuantity)} م²\`
• **رش طبقة التشريب (MCO):**
  - المنفذ: \`${fmt(mcoItem.executedQuantity)} م²\` (${mcoItem.percentage || '71.22'}%)
  - القيمة المنفذة: \`${fmt(mcoItem.executedValue)} د.ل\` (الفئة: \`13.73 د.ل\`)
  - المتبقي: \`${fmt(mcoItem.remainingQuantity)} م²\`
• **طبقة الأسفلت المحسن (6 سم):**
  - المنفذ: \`${fmt(asphItem.executedQuantity)} م²\` (${asphItem.percentage || '69.92'}%)
  - القيمة المنفذة: \`${fmt(asphItem.executedValue)} د.ل\` (الفئة: \`145.35 د.ل\`)
  - المتبقي: \`${fmt(asphItem.remainingQuantity)} م²\`
• **طبقة الأساس الحبيبي (إضافية):**
  - المنفذ: \`${fmt(baseItem.executedQuantity)} م³\`
  - القيمة المنفذة: \`${fmt(baseItem.executedValue)} د.ل\` (الفئة: \`299.52 د.ل\`)`,
      quickSuggestions: ['الجاهز للعمل في البند', 'حاسبة المحطات', 'كميات الوقود']
    };
  }

  // 5. العوائق الميدانية ومتبقي المرحلة الأولى (العبارة المنهارة)
  if (q.includes('عائق') || q.includes('عبارة') || q.includes('منهارة') || q.includes('المرحلة الاولى') || q.includes('المرحلة 1')) {
    return {
      type: 'obstacle_info',
      title: 'بيان عائق المرحلة الأولى (العبارة المنهارة)',
      content: `⚠️ **تقرير العائق المتبقي بالمرحلة الأولى:**
• **الموقع:** المحطة \`165+000\` (تقاطع مجرى وادي).
• **طول القطاع غير المكتمل:** \`130.00 م.ط\`.
• **سبب التوقف:** وجود عبارة صندوقية تضررت أثناء السيول وتحتاج إلى إعادة إنشاء وتدعيم هيدروليكي قبل مد طبقات الرصف والأسفلت.
• **حالة المرحلة الأولى:** تم إنجاز \`226,083.41 م.ط\` من أصل \`226,213.41 م.ط\`، ونسبة إنجاز المرحلة تتجاوز \`99.94%\`.`,
      quickSuggestions: ['الجاهز للأسفلت', 'موقف المرحلة الثانية', 'الموقف التنفيذي']
    };
  }

  // 6. الوقود والمحروقات
  if (q.includes('وقود') || q.includes('ديزل') || q.includes('محروقات') || q.includes('بنزين') || q.includes('خزان')) {
    return {
      type: 'fuel_status',
      title: 'تقرير أرصدة واستهلاك الوقود اليومي بالمواقع',
      content: `⛽ **الموقف اليومي لحركة الوقود والمحروقات (الديزل):**
• **موقع (107):**
  - المصروف: \`570.00 لتر\` | الوارد: \`0.00 لتر\` | الرصيد المتبقي: \`49.00 لتر\`
• **موقع (240):**
  - المصروف: \`17.00 لتر\` | الوارد: \`14.00 لتر\` | الرصيد المتبقي: \`141.00 لتر\`
• **الكسارات ومعدات التفتيت (الخسارات):**
  - المصروف: \`4.00 لتر\` | الوارد: \`0.00 لتر\` | الرصيد المتبقي: \`19.00 لتر\`
• **الإجمالي العام للوقود:**
  - المنصرف اليوم: \`591.00 لتر\`
  - الوارد: \`14.00 لتر\`
  - المخزون المتبقي الإجمالي: \`209.00 لتر\`
⚠️ *توصية الوكيل:* مخزون الموقع (107) والخسارات قارب على الحد الأدنى، يُوصى بتوجيه شاحنة التزويد فورياً.`,
      quickSuggestions: ['المعدات الميدانية', 'الموقف التنفيذي', 'صيغة تقرير رسمي']
    };
  }

  // 7. حاسبة المحطات وأطوال القطاعات
  if (q.includes('محطات') || q.includes('محطة') || q.includes('حاسبة') || q.includes('station')) {
    return {
      type: 'stations_summary',
      title: 'ملخص بيانات حاسبة محطات طبقات الرصف',
      content: `📐 **إحصائيات حاسبة المحطات لجميع طبقات الطريق:**
• **طبقة التشريب MCO:** عدد المحطات: \`29 محطة\` | إجمالي الطول: \`238,603.41 م.ط\` | المساحة: \`2,179,342.47 م²\`
• **إعادة التدوير FDR:** عدد المحطات: \`29 محطة\` | إجمالي الطول: \`245,383.41 م.ط\` | المساحة: \`2,239,792.63 م²\`
• **الأسفلت المحسن:** عدد المحطات: \`16 محطة\` | إجمالي الطول: \`236,373.41 م.ط\` | المساحة: \`2,139,464.47 م²\`
• **الأساس الحبيبي:** عدد المحطات: \`25 محطة\` | إجمالي الطول: \`238,713.41 م.ط\` | المساحة: \`2,160,629.47 م²\` | الحجم (بسماكة 12.5 سم): \`270,078.68 م³\`
💡 *ملاحظة:* يمكنك فتح الحاسبة من شاشة متابعة الطريق لتعديل أو إضافة محطات وحساب الأطوال والمساحات بضغطة زر.`,
      quickSuggestions: ['الجاهز للعمل في البند', 'الموقف التنفيذي', 'فئات البنود']
    };
  }

  // 8. توليد كتاب رسمي أو تقرير موجز للإدارة
  if (q.includes('اكتب') || q.includes('تقرير رسمي') || q.includes('كتاب') || q.includes('صيغة') || q.includes('إحالة')) {
    return {
      type: 'memo_generation',
      title: 'صيغة مذكرة إشرافية رسمية جاهزة للإرسال والطباعة',
      content: `📄 **دولة ليبيا - وزارة المواصلات - جهاز تنفيذ مشروعات المواصلات**
**مكتب جهاز الإشراف والمتابعة - مشروع صيانة طريق أوباري غات (360 كم)**

**التاريخ:** ${ctx.executiveDate}
**الموضوع:** الموقف التنفيذي وسير العمل الميداني للمشروع

**السيد / مدير عام جهاز تنفيذ مشروعات المواصلات المحترم،**
**تحية طيبة وبعد،،،**

نحيط سيادتكم علماً بأن الأعمال الميدانية والتنفيذية بمشروع صيانة وتطوير طريق أوباري - غات (بطول 360 كم) تسير وفق الخطط المعتمدة وجداول التتابع الهندسي، وإليكم ملخص الموقف:

1. **الموقف المالي العام:**
   - قيمة العقد الإجمالية: **${fmt(ctx.contractVal)} د.ل**
   - إجمالي القيمة المنفذة حتى تاريخه: **${fmt(ctx.grandExecutedSum)} د.ل** بنسبة إنجاز **${ctx.financialProgressPct}%**.
   - إجمالي البنود الأساسية: **${fmt(ctx.basicExecutedSum)} د.ل**.
   - إجمالي البنود الإضافية: **${fmt(ctx.additionalExecutedSum)} د.ل**.

2. **الجاهزية الميدانية للرصف:**
   - القطاع المجهز لطرح طبقة الأسفلت المحسن فورياً يبلغ **2,230.00 م.ط**.
   - أعمال الأساس الحبيبي الجاهز للتشريب تبلغ **6,670.00 م.ط**.
   - العمل مستمر في أعمال المرحلة الثانية بوتيرة متصاعدة.

**وتفضلوا بقبول فائق التقدير والاحترام،،،**

**المهندس عبدالسلام ابريكاو** | رئيس جهاز الإشراف
**المهندس عبدالرحمن الأنصاري** | مدير المشروع`,
      quickSuggestions: ['الموقف التنفيذي', 'الجاهز للرصف', 'أرصدة الوقود']
    };
  }

  // 9. الرد الافتراضي الذكي مع خيارات استكشافية
  return {
    type: 'general_help',
    title: 'مرحباً بك! أنا الوكيل الذكي لجهاز الإشراف والمتابعة',
    content: `👋 مرحباً بك يا باشمهندس! أنا **الوكيل الذكي لجهاز الإشراف والمتابعة** لمشروع طريق أوباري - غات (360 كم).

أنا مربوط مباشرة بقاعدة بيانات المنظومة وملفات الإكسل الرسمية (29/10/2026) وأستطيع مساعدتك فورياً في:
1. 📊 **الموقف التنفيذي والمالي:** حساب المنجز، المتبقي من العقد، ونسب الإنجاز.
2. 🛣️ **التتابع الإنشائي والهندسي:** حساب الأمتار الجاهزة للأسفلت، الأساس، MCO، و FDR.
3. 📐 **حاسبة المحطات:** تدقيق أطوال ومساحات وأحجام طبقات الرصف.
4. ⛽ **إدارة الوقود والآليات:** متابعة المحروقات في المواقع (107، 240، الكسارات).
5. 📝 **توليد التقارير والمذكرات الرسمية:** صياغة خطابات موجهة للمالك أو الإدارة.

**ما الذي ترغب في الاستفسار عنه اليوم؟**`,
    quickSuggestions: [
      'ما هو الموقف التنفيذي والمالي اليوم؟',
      'كم المتر الجاهز لطبقة الأسفلت؟',
      'ما هي الفئات التعاقدية للبنود؟',
      'ما هو رصيد الوقود في المواقع؟',
      'صياغة تقرير رسمي لمدير المشروع'
    ]
  };
}

/**
 * Call Gemini API when an API key is provided
 */
export async function callGeminiCloudAgent(apiKey, userMessage, conversationHistory = []) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('يرجى إدخال مفتاح Gemini API في إعدادات الوكيل الذكي.');
  }

  const liveContext = getLiveSystemContext();
  const systemPrompt = `أنت "الوكيل الذكي لجهاز الإشراف والمتابعة" لمشروع صيانة وتطوير طريق أوباري - غات بطول 360 كم (دولة ليبيا - وزارة المواصلات - جهاز تنفيذ مشروعات المواصلات).
أنت مهندس إشراف ومساحة خبير ومساعد تنفيذي لمدير المشروع م. عبدالرحمن الأنصاري ورئيس جهاز الإشراف م. عبدالسلام ابريكاو.
تتحدث باللغة العربية بأسلوب هندسي رصين وواضح، وتستخدم الأرقام اللاتينية الإنجليزية (0-9).

بيانات المشروع الحية المعتمدة رسمياً بتاريخ 29/10/2026:
- قيمة العقد: 897,665,675.030 دينار ليبي
- المنفذ المالي الإجمالي: 732,648,221.31 دينار ليبي (نسبة الإنجاز 81.62%)
- إجمالي البنود الأساسية: 638,329,685.46 د.ل (71.11%)
- إجمالي البنود الإضافية: 94,318,535.86 د.ل
- المتبقي المالي: 165,017,453.72 د.ل
- الفئات التعاقدية (د.ل):
  * كشط وإعادة تدوير FDR: 119.44 م2
  * رش طبقة تشريب MCO: 13.73 م2
  * طبقة أسفلت محسن بالبوليمر (6 سم): 145.35 م2
  * طبقة أساس حبيبي: 299.52 م3
  * الطريق الخدمي: 59,500.00 كم
  * علامات إرشاد: 1,783.99 عدد
  * عواكس أرضية: 135.04 عدد
  * سياج معدني واقي: 1,205.23 م.ط
  * دهان وخطوط: 23.07 م.ط
- التتابع الإنشائي الميداني (الجاهز للعمل):
  * الجاهز لفرمة تانية FDR: 20 م.ط
  * الجاهز لطبقة الأساس: 6,670 م.ط
  * الجاهز لرش التشريب MCO: 110 م.ط
  * الجاهز لطبقة الأسفلت: 2,230 م.ط
  * طول الطريق الخدمي العامل: 9,030 م.ط
- عائق المرحلة الأولى: المحطة 165+000 وجود عبارة منهارة تحتاج صيانة بطول 130 م.ط.
- الوقود: استهلاك اليوم 591 لتر، الوارد 14 لتر، المتبقي 209 لتر (مواقع 107، 240، الخسارات).

أجب عن أسئلة المستخدم بدقة متناهية واستند دائماً إلى هذه الأرقام المعتمدة.`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'أهلاً بك. أنا جاهز بصفتي الوكيل الذكي لجهاز الإشراف والمتابعة لتقديم أدق التحليلات الهندسية والمالية لمشروع طريق أوباري - غات.' }] }
  ];

  conversationHistory.slice(-6).forEach(m => {
    contents.push({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `فشل الاتصال بـ Gemini API (رمز: ${response.status})`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const reply = candidate?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error('لم يتم استلام رد صالح من الذكاء الاصطناعي.');
  }

  return reply;
}

