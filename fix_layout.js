const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
code = code.replace(/<div className="flex-1 overflow-y-auto overscroll-contain bg-\[#F8F4F0\] p-4 sm:p-6 lg:p-8">\n          <div className="flex-1 overflow-y-auto overscroll-contain bg-\[#F8F4F0\] p-4 sm:p-6 lg:p-8\">\{children\}<\/div>\n        <\/div>/, '<div className="flex-1 overflow-y-auto overscroll-contain bg-[#F8F4F0] p-4 sm:p-6 lg:p-8">\n          {children}\n        </div>');
fs.writeFileSync('src/app/dashboard/layout.tsx', code);
