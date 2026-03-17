const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const startIndex = content.indexOf('{/* HEADER */}');
if (startIndex !== -1) {
  // Find the end of the HEADER block.
  // The block starts with <div className="flex items-start justify-between">
  // It contains two child divs, and ends with </div>
  // It is immediately followed by {/* ALERT BANNER */}
  const endIndex = content.indexOf('{/* ALERT BANNER */}');
  if (endIndex !== -1) {
    const headerBlock = content.substring(startIndex, endIndex);
    content = content.replace(headerBlock, '');
    fs.writeFileSync('src/app/dashboard/page.tsx', content);
    console.log("Successfully removed HEADER block.");
  }
}
