const fs = require('fs');

let content = fs.readFileSync('src/views/MainSystem.jsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const findStr = '    const handleTabChange = (tabId) => {\n      setIsMobileSidebarOpen(false);\n      setActiveTab(tabId);\n    };';

const replacement = `    const handleTabChange = (tabId) => {
      setIsMobileSidebarOpen(false);
      const isDev = (currentUser?.role || '').includes('تطوير') || currentUser?.username === 'admin' || currentUser?.username === 'dev';
      if (!isDev && typeof window !== 'undefined') {
        try {
          const all = JSON.parse(localStorage.getItem('system_user_section_permissions') || '{}');
          const userPerms = all[currentUser?.username];
          if (Array.isArray(userPerms) && userPerms.length > 0 && !userPerms.includes(tabId)) {
            console.warn(\`User \${currentUser?.username} is not permitted to access section: \${tabId}\`);
            return;
          }
        } catch (e) {}
      }
      setActiveTab(tabId);
    };`;

if (content.includes(findStr)) {
  content = content.replace(findStr, replacement);
  fs.writeFileSync('src/views/MainSystem.jsx', content, 'utf8');
  console.log('✓ Successfully patched handleTabChange in MainSystem.jsx');
} else {
  console.log('findStr not found');
}
