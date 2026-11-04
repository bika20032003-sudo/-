const fs = require('fs');
const path = require('path');

console.log('=== Applying Full System Permissions with Deletion Restriction ===');

// 1. UPDATE src/utils/aiAgentEngine.js
let enginePath = path.join(__dirname, '../src/utils/aiAgentEngine.js');
let engineCode = fs.readFileSync(enginePath, 'utf8');

// Add delete intent check in generateOfflineSupervisionResponse
const deleteResponseBlock = `  // 0. Safety Guard: Full permissions granted EXCEPT deletion
  const isDeleteIntent = lower.includes('احذف') || lower.includes('مسح') || lower.includes('حذف') || lower.includes('تصفير') || lower.includes('الغاء تقرير') || lower.includes('delete');
  if (isDeleteIntent) {
    return \`🛡️ **ضوابط الصلاحيات الأمنية لجهاز الإشراف:**
أهلاً بك يا باشمهندس. بصفتي الوكيل الذكي لجهاز الإشراف والمتابعة، تم منحي **كافة الصلاحيات التشغيلية والتحليلية والهندسية الشاملة لكافة أقسام المنظومة عدا صلاحية الحذف**.

تم قفل وحظر صلاحية الحذف نهائياً كمعيار أمان هندسي وقانوني صارم للحفاظ على سلامة أرشفة وسجلات **مشروع صيانة وتطوير طريق أوباري - غات (360 كم)** ومنع أي فقدان للبيانات المعتمدة.

يمكنني مساعدتك في:
1. 📊 استعراض وتحليل أي تقرير أو كميات بالموقف التنفيذي ومسار الطريق.
2. 📝 صياغة التقارير اليومية والتنفيذية والخطابات الرسمية بدقة.
3. 📐 حساب أطوال ومساحات المحطات، والكميات المنفذة والمتبقية.
4. ⛽ متابعة كميات وأرصدة الوقود، وسجل جاهزية الآليات والمعدات.\`;
  }
`;

if (!engineCode.includes('isDeleteIntent')) {
  engineCode = engineCode.replace(
    'export function generateOfflineSupervisionResponse(userMessage) {\n  const lower = (userMessage || \'\').toLowerCase();',
    'export function generateOfflineSupervisionResponse(userMessage) {\n  const lower = (userMessage || \'\').toLowerCase();\n' + deleteResponseBlock
  );
  console.log('✓ Added Deletion Restriction safety guard in offline engine');
}

// In systemPrompt for Gemini Cloud, emphasize full permissions EXCEPT delete
const oldPromptSecurity = `أجب عن استفسارات المهندسين بدقة متناهية واستند دائماً إلى هذه الأرقام المعتمدة مع تقديم توصيات هندسية عملية.`;
const newPromptSecurity = `صلاحيات الوكيل الذكي المعتمدة وقواعد الأمان:
- أنت مفوض بكافة الصلاحيات الشاملة لكافة أقسام وعمليات المنظومة (قراءة وتحليل الموقف التنفيذي، مسار الـ 360 كم، أعمال الرصف FDR والأسفلت، جداول المحطات، كميات وأرصدة الوقود، سجل الآليات، أرشيف التقارير، وصياغة المراسلات الرسمية).
- قيد الأمان الصارم (استثناء الحذف): ليس لديك أي صلاحية لحذف أي تقارير أو مستندات أو آليات أو مستخدمين من المنظومة، وإذا طلب منك أي مستخدم الحذف، وضّح له بأدب وحزم: "عذراً يا باشمهندس، تم منحي كافة الصلاحيات التشغيلية والتحليلية بالمنظومة عدا صلاحية الحذف لحماية سجلات ووثائق المشروع المعتمدة."
أجب عن استفسارات المهندسين بدقة متناهية واستند دائماً إلى هذه الأرقام المعتمدة مع تقديم توصيات هندسية عملية.`;

if (engineCode.includes(oldPromptSecurity)) {
  engineCode = engineCode.replace(oldPromptSecurity, newPromptSecurity);
  console.log('✓ Enforced Full Permissions Except Delete in Cloud Gemini Prompt');
}

fs.writeFileSync(enginePath, engineCode, 'utf8');

// 2. UPDATE src/components/AIAgentWidget.jsx
let widgetPath = path.join(__dirname, '../src/components/AIAgentWidget.jsx');
let widgetCode = fs.readFileSync(widgetPath, 'utf8');

if (!widgetCode.includes('صلاحيات كاملة بالمنظومة')) {
  widgetCode = widgetCode.replace(
    `أنا مربوط مباشرة بأحدث بيانات الموقف التنفيذي (29/10/2026)، حاسبة المحطات، التتابع الإنشائي، وأرصدة الوقود الميدانية.`,
    `أنا مربوط مباشرة بكافة أقسام المنظومة وممنوح **كافة الصلاحيات التشغيلية والتحليلية والهندسية الشاملة (عدا صلاحية الحذف لحماية بيانات وسجلات المشروع)**.`
  );
  console.log('✓ Updated AIAgentWidget welcome message with permissions notice');
}

fs.writeFileSync(widgetPath, widgetCode, 'utf8');

// 3. UPDATE src/views/AIAgentView.jsx
let viewPath = path.join(__dirname, '../src/views/AIAgentView.jsx');
let viewCode = fs.readFileSync(viewPath, 'utf8');

if (!viewCode.includes('صلاحيات كاملة بالمنظومة')) {
  viewCode = viewCode.replace(
    `أنا مربوط مباشرة بأحدث بيانات الموقف التنفيذي (29/10/2026)، حاسبة المحطات، التتابع الإنشائي، وأرصدة الوقود الميدانية.`,
    `أنا مربوط مباشرة بكافة أقسام المنظومة وممنوح **كافة الصلاحيات التشغيلية والتحليلية والهندسية الشاملة (عدا صلاحية الحذف لحماية بيانات وسجلات المشروع)**.`
  );
  console.log('✓ Updated AIAgentView welcome message with permissions notice');
}

fs.writeFileSync(viewPath, viewCode, 'utf8');

// 4. UPDATE src/views/ReportsArchiveView.jsx (Restrict Delete to Dev Account)
let archivePath = path.join(__dirname, '../src/views/ReportsArchiveView.jsx');
let archiveCode = fs.readFileSync(archivePath, 'utf8');

// Ensure isDevUser is imported
if (!archiveCode.includes('isDevUser')) {
  archiveCode = archiveCode.replace(
    "import { canAccessTwoPhaseReport } from '../utils/permissionUtils';",
    "import { canAccessTwoPhaseReport, isDevUser } from '../utils/permissionUtils';"
  );
}

// In table row delete button
const oldArchiveDelete = `                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setReportToDelete(r)}
                            title="حذف التقرير"
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '0.4rem 0.65rem',
                              borderRadius: '7px',
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>`;

const newArchiveDelete = `                          {/* Delete (متاح حصرياً لحساب التطوير/الإدارة المشرفة) */}
                          {isDevUser(currentUser) && (
                            <button
                              type="button"
                              onClick={() => setReportToDelete(r)}
                              title="حذف التقرير (صلاحية حساب التطوير)"
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '0.4rem 0.65rem',
                                borderRadius: '7px',
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}`;

if (archiveCode.includes(oldArchiveDelete)) {
  archiveCode = archiveCode.replace(oldArchiveDelete, newArchiveDelete);
  console.log('✓ Restricted delete button in ReportsArchiveView to dev account only');
}

fs.writeFileSync(archivePath, archiveCode, 'utf8');

// 5. UPDATE src/views/FuelView.jsx (Restrict Fuel Delete to Dev Account)
let fuelPath = path.join(__dirname, '../src/views/FuelView.jsx');
let fuelCode = fs.readFileSync(fuelPath, 'utf8');

if (!fuelCode.includes('isDevUser')) {
  fuelCode = `import { isDevUser } from '../utils/permissionUtils';\n` + fuelCode;
}

const oldFuelDelete = `<button
                          onClick={() => setReportToDelete(rep)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                          title="حذف هذا التقرير"
                        >
                          <Trash2 size={13} />
                        </button>`;

const newFuelDelete = `{isDevUser(currentUser) && (
                        <button
                          onClick={() => setReportToDelete(rep)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                          title="حذف هذا التقرير (صلاحية حساب التطوير)"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}`;

if (fuelCode.includes(oldFuelDelete)) {
  fuelCode = fuelCode.replace(oldFuelDelete, newFuelDelete);
  console.log('✓ Restricted delete button in FuelView to dev account only');
}

fs.writeFileSync(fuelPath, fuelCode, 'utf8');

// 6. UPDATE src/views/TargetedWorksView.jsx (Restrict Targeted Works Delete to Dev Account)
let targetedPath = path.join(__dirname, '../src/views/TargetedWorksView.jsx');
let targetedCode = fs.readFileSync(targetedPath, 'utf8');

if (!targetedCode.includes('isDevUser')) {
  targetedCode = `import { isDevUser } from '../utils/permissionUtils';\n` + targetedCode;
}

const oldTargetedDelete = `<button
                          type="button"
                          onClick={() => setReportToDelete(r)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          title="حذف التقرير"
                        >
                          <Trash2 size={15} />
                        </button>`;

const newTargetedDelete = `{isDevUser(currentUser) && (
                        <button
                          type="button"
                          onClick={() => setReportToDelete(r)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          title="حذف التقرير (صلاحية حساب التطوير)"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}`;

if (targetedCode.includes(oldTargetedDelete)) {
  targetedCode = targetedCode.replace(oldTargetedDelete, newTargetedDelete);
  console.log('✓ Restricted delete button in TargetedWorksView to dev account only');
}

fs.writeFileSync(targetedPath, targetedCode, 'utf8');

console.log('=== All Permission Updates Completed Successfully ===');

