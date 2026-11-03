const fs = require('fs');
const path = require('path');

// 1. UPDATE src/index.css PRINT RULES
function updateIndexCss() {
  const cssPath = path.join(__dirname, '..', 'src', 'index.css');
  let content = fs.readFileSync(cssPath, 'utf8');

  const oldPrint = `/* ========== PRINT MEDIA ========== */
/* Top-level A4 Landscape Page Rule */
@page {
  size: A4 landscape;
  margin: 4mm 5mm;
}
@media print {
  .custom-app-sidebar,
  .custom-app-navbar,
  .sidebar-mobile-backdrop,
  .navbar-mobile-toggle-btn,
  button:not(.print-allowed) {
    display: none !important;
  }
  .custom-system-main {
    margin-right: 0 !important;
    width: 100% !important;
  }
  .custom-page-container {
    padding: 0 !important;
  }
  body { background: #fff !important; }
}`;

  const newPrint = `/* ========== PRINT MEDIA ========== */
/* Top-level A4 Landscape Page Rule */
@page {
  size: A4 landscape;
  margin: 4mm 5mm;
}
@media print {
  html, body {
    min-height: 0 !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    overflow: visible !important;
  }
  #root {
    min-height: 0 !important;
    height: auto !important;
  }
  .custom-app-sidebar,
  .custom-app-navbar,
  .sidebar-mobile-backdrop,
  .navbar-mobile-toggle-btn,
  button:not(.print-allowed) {
    display: none !important;
  }
  .custom-system-main {
    margin-right: 0 !important;
    width: 100% !important;
    min-height: 0 !important;
    height: auto !important;
    padding: 0 !important;
  }
  .custom-page-container {
    padding: 0 !important;
    min-height: 0 !important;
    height: auto !important;
  }
}`;

  // Handle both CRLF and LF
  content = content.replace(oldPrint.replace(/\r?\n/g, '\r\n'), newPrint.replace(/\r?\n/g, '\r\n'));
  content = content.replace(oldPrint.replace(/\r?\n/g, '\n'), newPrint.replace(/\r?\n/g, '\n'));
  fs.writeFileSync(cssPath, content, 'utf8');
  console.log('Updated src/index.css print media rules.');
}

updateIndexCss();

