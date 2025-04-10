const { execSync } = require("node:child_process");
const process = require("node:process");

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("❌ Please provide a module name. Example: yarn generate:module moduleA");
  process.exit(1);
}

try {
  execSync(`nest generate module ${moduleName} --no-spec`, { stdio: "inherit" });
  execSync(`nest generate controller ${moduleName} --no-spec`, { stdio: "inherit" });
  execSync(`nest generate service ${moduleName} --no-spec`, { stdio: "inherit" });
}
catch (e) {
  console.error("❌ Error generating files:", e.message);
}
