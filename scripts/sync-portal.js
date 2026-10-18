import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const worktreeDir = path.resolve(rootDir, '..', 'gh-pages-worktree');

function run(cmd, cwd = rootDir) {
  console.log(`\x1b[36m➜ ${cmd}\x1b[0m (in ${cwd})`);
  return execSync(cmd, { cwd, stdio: 'inherit' });
}

function runSilent(cmd, cwd = rootDir) {
  try {
    return execSync(cmd, { cwd, stdio: 'pipe' }).toString().trim();
  } catch {
    return '';
  }
}

async function main() {
  console.log('\n\x1b[33m⚡ بدء مزامنة وتحديث البوابة تلقائياً على GitHub والرابط المباشر...\x1b[0m\n');

  const timestamp = new Date().toLocaleString('ar-LY', { timeZone: 'Africa/Tripoli' });

  // 1. Build the frontend
  console.log('\x1b[32m[1/4] بناء ملفات الواجهة (Vite Build)...\x1b[0m');
  run('npm run build', rootDir);

  // 2. Commit and push source changes on current branch (ubari-portal)
  console.log('\n\x1b[32m[2/4] حفظ ورفع الكود المصدري إلى GitHub (فرع ubari-portal)...\x1b[0m');
  const status = runSilent('git status -s', rootDir);
  if (status) {
    run('git add .', rootDir);
    try {
      run(`git commit -m "chore(sync): تحديث تلقائي للبوابة - ${timestamp}"`, rootDir);
    } catch {
      // Nothing new to commit
    }
  }
  try {
    run('git push origin ubari-portal', rootDir);
    console.log('✔ تم رفع الكود إلى فرع ubari-portal بنجاح.');
  } catch (err) {
    console.warn('تنبيه عند رفع فرع الكود:', err.message);
  }

  // 3. Sync to gh-pages branch
  console.log('\n\x1b[32m[3/4] نشر النسخة المبنية على الرابط الحي (gh-pages)...\x1b[0m');
  // Clean old worktree if left over
  if (fs.existsSync(worktreeDir)) {
    try {
      runSilent(`git worktree remove "${worktreeDir}" --force`, rootDir);
    } catch {}
    if (fs.existsSync(worktreeDir)) {
      fs.rmSync(worktreeDir, { recursive: true, force: true });
    }
  }

  try {
    run(`git worktree add "${worktreeDir}" origin/gh-pages`, rootDir);

    const distDir = path.join(rootDir, 'dist');
    const targetDirs = [
      path.join(worktreeDir, 'portal'),
      path.join(worktreeDir, 'ubari-portal'),
      path.join(worktreeDir, 'client', 'dist', 'portal'),
      path.join(worktreeDir, 'client', 'dist', 'ubari-portal')
    ];

    for (const target of targetDirs) {
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(distDir, target, { recursive: true });
      // 404 for SPA routing
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, path.join(target, '404.html'));
      }
    }

    run('git add portal ubari-portal client', worktreeDir);
    try {
      run(`git commit -m "deploy: نشر تلقائي للبوابة - ${timestamp}"`, worktreeDir);
    } catch {}

    run('git pull --rebase origin gh-pages', worktreeDir);
    run('git push origin HEAD:gh-pages', worktreeDir);
    console.log('✔ تم تحديث موقع GitHub Pages المباشر بنجاح.');
  } finally {
    try {
      runSilent(`git worktree remove "${worktreeDir}" --force`, rootDir);
    } catch {}
  }

  console.log('\n\x1b[32m==================================================\x1b[0m');
  console.log('\x1b[32m✔ اكتمل التحديث والمزامنة بنجاح تام!\x1b[0m');
  console.log('\x1b[36mرابط البوابة المباشر:\x1b[0m https://bika20032003-sudo.github.io/-/portal/');
  console.log('\x1b[32m==================================================\x1b[0m\n');
}

main().catch((err) => {
  console.error('\x1b[31mحدث خطأ أثناء التحديث:\x1b[0m', err);
  process.exit(1);
});
