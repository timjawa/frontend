const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/My Activity/Project 4/frontend/app/(admin)/admin/(authenticated)');
files.push('c:/My Activity/Project 4/frontend/lib/api.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  if (content.includes('const API_BASE = process.env.NEXT_PUBLIC_API_URL')) {
    content = content.replace(/const API_BASE = process\.env\.NEXT_PUBLIC_API_URL[^;]+;/, 'const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== \'undefined\' && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? `${window.location.protocol}//${window.location.hostname}:8000/api` : "https://api.jembersiaga.my.id/api");');
    content = content.replace(/\$\{API_BASE\}/g, '${getApiBase()}');
    changed = true;
  }

  if (file.endsWith('api.ts') && content.includes('baseURL: process.env.NEXT_PUBLIC_BACKEND_URL')) {
    content = content.replace(/baseURL: process\.env\.NEXT_PUBLIC_BACKEND_URL[^,]+,/, 'baseURL: getBaseUrl(),');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
