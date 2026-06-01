import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const apiDir = path.join(root, "src/app/api");
const stashDir = path.join(root, ".gh-pages-stash-api");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/gaming-adda";

function stashApiRoute() {
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(stashDir)) fs.rmSync(stashDir, { recursive: true, force: true });
    fs.renameSync(apiDir, stashDir);
  }
}

function restoreApiRoute() {
  if (fs.existsSync(stashDir)) {
    if (fs.existsSync(apiDir)) fs.rmSync(apiDir, { recursive: true, force: true });
    fs.renameSync(stashDir, apiDir);
  }
}

stashApiRoute();

try {
  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_USE_API_PROXY: "false",
    },
  });

  const nojekyll = path.join(root, "out/.nojekyll");
  fs.writeFileSync(nojekyll, "");
  console.log(`\nStatic export ready in out/ (basePath: ${basePath})`);
} finally {
  restoreApiRoute();
}
