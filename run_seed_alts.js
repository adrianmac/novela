const fs = require('fs');
let code = fs.readFileSync('src/db/seed.ts', 'utf8');
code = code.replace(/seedAlterations\(\)\.catch\(console\.error\);/g, '');
code += `
seedAlterations().then(() => {
  console.log("Alterations seeded");
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
`;
fs.writeFileSync('src/db/seed.ts', code);
