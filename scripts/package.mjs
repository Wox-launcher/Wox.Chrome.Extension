// Packages the dist/ directory into a Chrome Web Store-ready zip file.
// The zip stores files at the archive root (dist/ contents, not dist/ itself)
// so it loads correctly as an unpacked extension when extracted.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const distDir = join(process.cwd(), "dist");
const zipPath = join(process.cwd(), "wox-chrome-extension.zip");

if (!existsSync(distDir)) {
    console.error("dist/ directory not found. Run 'npm run build' first.");
    process.exit(1);
}

const entries = readdirSync(distDir);
if (entries.length === 0) {
    console.error("dist/ directory is empty. Run 'npm run build' first.");
    process.exit(1);
}

// Determine the platform and use the appropriate archiving tool.
const isWindows = process.platform === "win32";

if (isWindows) {
    // PowerShell Compress-Archive is available on all Windows machines.
    // -Path 'dist\*' stores files at the archive root.
    execSync(
        `powershell -NoProfile -Command "Compress-Archive -Path 'dist\\*' -DestinationPath '${zipPath}' -Force"`,
        { stdio: "inherit" }
    );
} else {
    // macOS/Linux: use zip CLI, archiving dist/ contents at root.
    execSync(`cd dist && zip -r ../wox-chrome-extension.zip . && cd ..`, {
        stdio: "inherit",
    });
}

// Verify the zip was created.
if (!existsSync(zipPath)) {
    console.error("Failed to create zip file.");
    process.exit(1);
}

const sizeKB = Math.round(statSync(zipPath).size / 1024);
console.log(`\nBuilt and packaged: wox-chrome-extension.zip (${sizeKB} KB)`);