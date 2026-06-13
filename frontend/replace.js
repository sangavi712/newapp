const fs = require('fs');
const path = require('path');

const targetDirs = [
  'achievements', 'buddy', 'emotion', 'games', 'kids', 'lessons', 'music', 'stories', 'vocabulary'
];

const basePath = path.join(__dirname, 'src', 'app', 'dashboard');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace standard card containers
  content = content.replace(/bg-white dark:bg-slate-900(.*?)(border border-slate-200(\/50)? dark:border-slate-800(\/40|\/50|\/60)?)(.*?)shadow-(sm|md|lg|xl|2xl)/g, 'bg-white dark:bg-slate-800$1border-2 border-slate-200 dark:border-slate-600$5shadow-md');
  
  // Replace remaining bg-white dark:bg-slate-900 that have borders
  content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-white dark:bg-slate-800');
  content = content.replace(/border border-slate-200(\/50|\/60)? dark:border-slate-800(\/40|\/50|\/60)?/g, 'border-2 border-slate-200 dark:border-slate-600');
  content = content.replace(/border border-slate-200 dark:border-slate-800/g, 'border-2 border-slate-200 dark:border-slate-600');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

targetDirs.forEach(dir => {
  const pagePath = path.join(basePath, dir, 'page.tsx');
  processFile(pagePath);
});
