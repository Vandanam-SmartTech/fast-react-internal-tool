#!/usr/bin/env node

/**
 * Icon Import Analyzer
 * Finds problematic icon imports that cause large bundle sizes
 * 
 * Run: node scripts/analyze-icon-imports.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const issues = [];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check for problematic patterns
  const patterns = [
    {
      regex: /import\s+\*\s+as\s+\w+\s+from\s+['"]react-icons\/\w+['"]/g,
      message: 'Importing entire react-icons library',
      severity: 'CRITICAL',
      fix: 'Use named imports: import { IconName } from "react-icons/fa"'
    },
    {
      regex: /import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"]/g,
      message: 'Importing entire lucide-react library',
      severity: 'CRITICAL',
      fix: 'Use named imports: import { IconName } from "lucide-react"'
    },
    {
      regex: /import\s+\w+\s+from\s+['"]react-icons['"]/g,
      message: 'Importing from react-icons root',
      severity: 'HIGH',
      fix: 'Import from specific icon set: import { FaIcon } from "react-icons/fa"'
    },
    {
      regex: /require\(['"]react-icons/g,
      message: 'Using require() for react-icons',
      severity: 'HIGH',
      fix: 'Use ES6 imports instead'
    },
    {
      regex: /import\s+\{[^}]{200,}\}\s+from\s+['"]lucide-react['"]/g,
      message: 'Importing too many icons from lucide-react',
      severity: 'MEDIUM',
      fix: 'Consider creating a barrel file for commonly used icons'
    }
  ];

  patterns.forEach(({ regex, message, severity, fix }) => {
    const matches = content.match(regex);
    if (matches) {
      matches.forEach(match => {
        const lines = content.substring(0, content.indexOf(match)).split('\n');
        const lineNumber = lines.length;
        
        issues.push({
          file: relativePath,
          line: lineNumber,
          severity,
          message,
          code: match.trim(),
          fix
        });
      });
    }
  });
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      analyzeFile(filePath);
    }
  });
}

console.log('🔍 Analyzing icon imports...\n');
walkDirectory(srcDir);

if (issues.length === 0) {
  console.log('✅ No problematic icon imports found!\n');
  process.exit(0);
}

// Group by severity
const critical = issues.filter(i => i.severity === 'CRITICAL');
const high = issues.filter(i => i.severity === 'HIGH');
const medium = issues.filter(i => i.severity === 'MEDIUM');

console.log(`Found ${issues.length} issues:\n`);

if (critical.length > 0) {
  console.log('🚨 CRITICAL ISSUES (Fix immediately - saves ~1.5 MiB):');
  console.log('═'.repeat(80));
  critical.forEach(issue => {
    console.log(`\n📁 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    console.log(`   Code: ${issue.code}`);
    console.log(`   Fix: ${issue.fix}`);
  });
  console.log('\n');
}

if (high.length > 0) {
  console.log('⚠️  HIGH PRIORITY ISSUES:');
  console.log('═'.repeat(80));
  high.forEach(issue => {
    console.log(`\n📁 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    console.log(`   Code: ${issue.code}`);
    console.log(`   Fix: ${issue.fix}`);
  });
  console.log('\n');
}

if (medium.length > 0) {
  console.log('ℹ️  MEDIUM PRIORITY ISSUES:');
  console.log('═'.repeat(80));
  medium.forEach(issue => {
    console.log(`\n📁 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    console.log(`   Fix: ${issue.fix}`);
  });
  console.log('\n');
}

// Summary
console.log('📊 SUMMARY:');
console.log('═'.repeat(80));
console.log(`Total Issues: ${issues.length}`);
console.log(`  🚨 Critical: ${critical.length}`);
console.log(`  ⚠️  High: ${high.length}`);
console.log(`  ℹ️  Medium: ${medium.length}`);
console.log(`\n💡 Estimated bundle size reduction: ~${Math.min(critical.length * 500 + high.length * 100, 1500)} KiB\n`);

process.exit(1);
