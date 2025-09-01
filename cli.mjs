#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { Compile } from "./Compiler.mjs";

const exec = promisify(execCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walk(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

async function precompile(templatesDir) {
  console.log("Running precompile...");

  const allFiles = await walk(templatesDir);
  const jsxFiles = allFiles.filter((file) => file.endsWith(".jsx"));

  for (const file of jsxFiles) {
    const relativePath = path.relative(templatesDir, file);
    const compiledPath = path.join(
      __dirname,
      "compiled-Templates",
      relativePath.replace(/\.jsx$/, ".mjs")
    );

    // ensure target directory exists
    await mkdir(path.dirname(compiledPath), { recursive: true });

    const code = await readFile(file, "utf8");
    const compiledCode = await Compile(code);
    await writeFile(compiledPath, compiledCode);

    console.log("✔", file, "→", compiledPath);
  }
  await writeFile(
    path.join(__dirname, "constants.mjs"),
    `
export const forceFreshImport = false;
export const forceFreshCompilation = false;
export const preCompile = true;
  `
  );
  console.log("✅ Precompile finished");
}

async function optimize() {
  console.log("Running optimize...");

  const packageJsonPath = path.join(__dirname, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  delete packageJson.dependencies["@babel/core"];
  delete packageJson.dependencies["@babel/preset-react"];
  packageJson.bundledDependencies = packageJson.bundledDependencies.filter(
    (e) => e != "@babel/preset-react" && e != "@babel/core"
  );

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log("Removing node_modules...");
  await rm(path.join(__dirname, "node_modules"), {
    recursive: true,
    force: true,
  });

  console.log("Reinstalling dependencies...");
  await exec(`cd ${__dirname} && npm i`);

  await writeFile(
    path.join(__dirname, "Compiler.mjs"),
    `
export async function Compile(code = "") {
  console.warn(
    "⚠ Templates already precompiled. If you add new templates, run 'npx esay_mailer precompile <dir>'"
  );
  return code;
}
`
  );

  console.log("✅ Optimize finished");
}

async function restore() {
  console.log("Restoring package...");
  await exec(
    `cd ${__dirname} && npm uninstall esay_mailer && npm i esay_mailer`
  );
  console.log("✅ Restore finished");
}

async function main() {
  const command = args[0];
  const targetDir = args[1] ? path.resolve(process.cwd(), args[1]) : null;

  switch (command) {
    case "precompile":
      if (!targetDir)
        return console.error("Error: Please provide the templates directory.");
      await precompile(targetDir);
      break;

    case "optimize":
      await optimize();
      break;

    case "restore":
      await restore();
      break;

    case "build":
      if (!targetDir)
        return console.error("Error: Please provide the templates directory.");
      await precompile(targetDir);
      await optimize();
      break;

    default:
      console.log(`
Easy Mailer CLI - Usage

Commands:
  npx esay_mailer precompile <templates-dir>
      Precompile all .jsx templates for performence (for production)

  npx esay_mailer optimize
      Remove Babel dependencies and shrink package size (for production)

  npx esay_mailer restore
      fix any wired issues by focing reinstalation of the package

  npx esay_mailer build <templates-dir>
      Precompile + optimize in one step
`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
});
