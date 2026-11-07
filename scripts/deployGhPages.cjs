const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log('Running:', cmd);
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf8' });
}

try {
  const root = path.resolve('.');
  const distDir = path.join(root, 'dist');
  const tempDir = path.join(root, '..', 'gh_pages_temp_dist_' + Date.now());

  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory does not exist! Run npm run build first.');
  }

  // Copy dist to temp
  fs.cpSync(distDir, tempDir, { recursive: true });
  console.log('Copied dist to temp:', tempDir);

  // Switch to gh-pages
  run('git checkout gh-pages');
  run('git pull origin gh-pages');

  // Delete old assets folder on gh-pages to prevent bloat
  const oldAssets = path.join(root, 'assets');
  if (fs.existsSync(oldAssets)) {
    fs.rmSync(oldAssets, { recursive: true, force: true });
  }

  // Copy temp contents into root
  const items = fs.readdirSync(tempDir);
  items.forEach(item => {
    const src = path.join(tempDir, item);
    const dest = path.join(root, item);
    fs.cpSync(src, dest, { recursive: true, force: true });
  });
  console.log('Overwrote root with new build files.');

  // Clean temp
  fs.rmSync(tempDir, { recursive: true, force: true });

  // Add all changes, commit and push
  run('git add -A');
  try {
    run('git commit -m "deploy: resolve AI agent import crash, eliminate recovery screen, and lock 1-page fit"');
    run('git push origin gh-pages');
    console.log('Successfully pushed to gh-pages!');
  } catch (err) {
    console.log('No new changes or push error:', err.message);
  }

  // Switch back to main
  run('git checkout main');
  console.log('Returned to main branch.');
} catch (e) {
  console.error('Deployment failed:', e.message);
  try {
    execSync('git checkout main', { stdio: 'inherit' });
  } catch (_) {}
  process.exit(1);
}

