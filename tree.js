#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Default folders to ignore
const DEFAULT_IGNORE = [
  'node_modules',
  '.git',
  '.DS_Store',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.nyc_output',
  'tmp',
  'temp',
  '.cache',
  '.env',
  '.vscode',
  '.idea'
];

function shouldIgnore(fileName, ignoreList) {
  return ignoreList.some(pattern => {
    if (pattern.includes('*')) {
      // Simple glob pattern support
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(fileName);
    }
    return fileName === pattern;
  });
}

function printTree(dir, prefix = '', ignoreList = DEFAULT_IGNORE, maxDepth = Infinity, currentDepth = 0) {
  if (currentDepth >= maxDepth) return;
  
  try {
    const files = fs.readdirSync(dir);
    const filteredFiles = files.filter(file => !shouldIgnore(file, ignoreList));
    
    filteredFiles.forEach((file, index) => {
      const fullPath = path.join(dir, file);
      const isLast = index === filteredFiles.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      console.log(prefix + connector + file);

      if (fs.statSync(fullPath).isDirectory()) {
        printTree(fullPath, prefix + (isLast ? '    ' : '│   '), ignoreList, maxDepth, currentDepth + 1);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error.message}`);
  }
}

function printHelp() {
  console.log(`
Usage: tree [directory] [options]

Arguments:
  directory         Directory to print (default: current directory)

Options:
  -i, --ignore      Comma-separated list of folders/files to ignore
  -d, --max-depth   Maximum depth to traverse (default: unlimited)
  -h, --help        Show this help message

Examples:
  tree                                    # Print current directory
  tree /path/to/project                   # Print specific directory
  tree -i node_modules,.git,dist          # Ignore specific folders
  tree -d 3                               # Limit to 3 levels deep
  tree /path/to/project -i build,tmp -d 2 # Combined options

Default ignored folders:
${DEFAULT_IGNORE.map(folder => `  ${folder}`).join('\n')}
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
let targetDir = '.';
let customIgnore = [];
let maxDepth = Infinity;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-h' || arg === '--help') {
    printHelp();
    process.exit(0);
  } else if (arg === '-i' || arg === '--ignore') {
    if (i + 1 < args.length) {
      customIgnore = args[i + 1].split(',').map(s => s.trim());
      i++; // Skip next argument
    }
  } else if (arg === '-d' || arg === '--max-depth') {
    if (i + 1 < args.length) {
      maxDepth = parseInt(args[i + 1], 10);
      if (isNaN(maxDepth)) {
        console.error('Error: max-depth must be a number');
        process.exit(1);
      }
      i++; // Skip next argument
    }
  } else if (!arg.startsWith('-')) {
    targetDir = arg;
  }
}

// Combine default ignore list with custom ignore list
const ignoreList = [...DEFAULT_IGNORE, ...customIgnore];

// Check if target directory exists
if (!fs.existsSync(targetDir)) {
  console.error(`Error: Directory '${targetDir}' does not exist`);
  process.exit(1);
}

// Print the tree
console.log(path.resolve(targetDir));
printTree(targetDir, '', ignoreList, maxDepth);