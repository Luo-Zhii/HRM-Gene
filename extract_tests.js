const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (filePath.endsWith('.spec.ts') || filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function parseTestFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const results = [];

  function visit(node, context) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      if (name === 'describe' || name === 'it') {
        const args = node.arguments;
        if (args.length > 0 && ts.isStringLiteral(args[0])) {
          const text = args[0].text;

          if (name === 'describe') {
            const newContext = [...context, text];
            ts.forEachChild(node, child => visit(child, newContext));
            return;
          } else if (name === 'it') {
            results.push({
              module: context[0] || 'Unknown',
              feature: context.slice(1).join(' / ') || 'General',
              testCase: text,
              file: filePath
            });
            return; // don't go deeper into `it`
          }
        }
      }
    }
    ts.forEachChild(node, child => visit(child, context));
  }

  visit(sourceFile, []);
  return results;
}

function generateMarkdown(results) {
  let md = '# HRM-DashStack: Master Test Documentation\n\n';

  // Group by Module
  const modules = {};
  let totalTests = 0;
  for (const r of results) {
    totalTests++;
    if (!modules[r.module]) modules[r.module] = [];
    modules[r.module].push(r);
  }

  md += `## 1. Summary\n`;
  md += `- **Total Modules:** ${Object.keys(modules).length}\n`;
  md += `- **Total Test Cases:** ${totalTests}\n\n`;

  md += `## 2. Detailed Test Cases\n\n`;

  for (const [moduleName, tests] of Object.entries(modules)) {
    md += `### Module: ${moduleName}\n`;
    md += `| Feature / Component | Test Case Description | Test Type (Inferred) |\n`;
    md += `|---|---|---|\n`;

    for (const t of tests) {
      let testType = 'Logic/Integration';
      if (t.file.includes('.controller.spec.ts')) {
        testType = 'API / Controller Integration';
      } else if (t.file.includes('.service.spec.ts')) {
        testType = 'Unit / Service Logic';
      } else if (t.file.includes('.gateway.spec.ts')) {
        testType = 'WebSocket / Gateway';
      }

      md += `| ${t.feature} | ${t.testCase} | ${testType} |\n`;
    }
    md += '\n';
  }

  return md;
}

// --- START OF REPLACEMENT CODE ---
// Configuration to scan both directories simultaneously
const scopes = ['backend', 'frontend'];
let allResults = [];
let totalFilesFound = 0;

console.log('Starting project scan...');

for (const scope of scopes) {
  const targetDir = path.join(__dirname, scope, 'src');

  if (fs.existsSync(targetDir)) {
    console.log(`\nScanning directory: ${scope}/src ...`);
    const testFiles = findTestFiles(targetDir);
    console.log(`Found ${testFiles.length} test files in ${scope}.`);

    totalFilesFound += testFiles.length;
    for (const file of testFiles) {
      // Add prefix to identify if the test case belongs to Front or Back
      const parsedResults = parseTestFile(file).map(result => ({
        ...result,
        module: `[${scope.toUpperCase()}] ${result.module}`
      }));
      allResults = allResults.concat(parsedResults);
    }
  } else {
    console.log(`Skipped: Directory not found ${targetDir}`);
  }
}

console.log(`\nTotal test files analyzed: ${totalFilesFound}.`);

// Start generating Markdown
const mdContent = generateMarkdown(allResults);

// Save file
const docsDir = path.join(__dirname, 'docs', 'test-cases');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const outPath = path.join(docsDir, 'Master_Test_Documentation.md');
fs.writeFileSync(outPath, mdContent);
console.log(`Successfully generated documentation at: ${outPath}\n`);