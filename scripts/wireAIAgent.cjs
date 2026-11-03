const fs = require('fs');
const path = require('path');

// 1. UPDATE src/views/MainSystem.jsx
function updateMainSystem() {
  const filePath = path.join(__dirname, '..', 'src', 'views', 'MainSystem.jsx');
  let code = fs.readFileSync(filePath, 'utf8');

  // Add imports
  if (!code.includes('AIAgentView')) {
    code = code.replace(
      "import { ExecutiveProgressView } from './ExecutiveProgressView';",
      "import { ExecutiveProgressView } from './ExecutiveProgressView';\nimport { AIAgentView } from './AIAgentView';\nimport { AIAgentWidget } from '../components/AIAgentWidget';"
    );
  }

  // Add tab title
  if (!code.includes("'ai-agent':")) {
    code = code.replace(
      "'executive-progress': 'الموقف التنفيذي (360 كم) - المالي والفني المعتمد',",
      "'executive-progress': 'الموقف التنفيذي (360 كم) - المالي والفني المعتمد',\n        'ai-agent': 'الوكيل الذكي لجهاز الإشراف والمتابعة (AI Engineering Agent)',"
    );
  }

  // Add tab render view
  if (!code.includes("activeTab === 'ai-agent'")) {
    code = code.replace(
      "{activeTab === 'users' && <UsersView currentUser={currentUser} />}",
      "{activeTab === 'users' && <UsersView currentUser={currentUser} />}\n            {activeTab === 'ai-agent' && <AIAgentView currentUser={currentUser} onNavigateTab={handleTabChange} />}"
    );
  }

  // Mount global AIAgentWidget
  if (!code.includes('<AIAgentWidget')) {
    code = code.replace(
      '{/* User Profile Modal with Photo Upload & Credentials */}',
      `{/* Global AI Agent Floating Assistant */}\n        <AIAgentWidget currentUser={currentUser} onNavigateTab={handleTabChange} />\n\n        {/* User Profile Modal with Photo Upload & Credentials */}`
    );
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Updated src/views/MainSystem.jsx');
}

// 2. UPDATE src/components/Sidebar.jsx
function updateSidebar() {
  const filePath = path.join(__dirname, '..', 'src', 'components', 'Sidebar.jsx');
  let code = fs.readFileSync(filePath, 'utf8');

  // Import Bot icon
  if (!code.includes('Bot,')) {
    code = code.replace('Camera, Mail,', 'Camera, Mail, Bot, Sparkles,');
  }

  // Add AI Agent menu item
  if (!code.includes("'ai-agent'")) {
    code = code.replace(
      "{ id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award }",
      "{ id: 'executive-progress', label: 'الموقف التنفيذي (360 كم)', icon: Award },\n      { id: 'ai-agent', label: 'الوكيل الذكي للإشراف', icon: Bot, badge: 'AI' }"
    );
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Updated src/components/Sidebar.jsx');
}

// 3. MIRROR FILES TO منظومة جهاز الاشراف
function mirrorFiles() {
  const targetRoot = path.join(__dirname, '..', 'منظومة جهاز الاشراف', 'src');
  if (!fs.existsSync(targetRoot)) {
    console.log('Mirror directory not found, skipping.');
    return;
  }

  const filesToCopy = [
    ['utils', 'aiAgentEngine.js'],
    ['components', 'AIAgentWidget.jsx'],
    ['views', 'AIAgentView.jsx'],
    ['views', 'MainSystem.jsx'],
    ['components', 'Sidebar.jsx']
  ];

  filesToCopy.forEach(pair => {
    const src = path.join(__dirname, '..', 'src', ...pair);
    const dest = path.join(targetRoot, ...pair);
    if (fs.existsSync(src)) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      console.log('Mirrored:', pair.join('/'));
    }
  });
}

try {
  updateMainSystem();
  updateSidebar();
  mirrorFiles();
  console.log('=== AI Agent successfully wired across the entire system! ===');
} catch (e) {
  console.error('Error wiring AI Agent:', e);
  process.exit(1);
}
