import { mkdir, readFile, stat, writeFile } from "fs/promises";
import render from "preact-render-to-string";
import { Compile } from "./Compiler.js";
import {
  forceFreshImport,
  preCompile,
  forceFreshCompilation,
} from "./constants.js";
import path from "path";
// for chachinh on memory
const moduleCache = {};
const moduleLastUpdates = {};

export async function renderTemplate(filePath, props = {}) {
  const filePathAsArray = filePath.split("/");
  const compiledFilePath =
    "./" +
    path.join(
      "compiled-Templates",
      filePathAsArray[filePathAsArray.length - 1].split(".")[0] + ".mjs"
    );
  console.log(compiledFilePath);
  const { code, compiledComponent } = await getCachedCompilation(
    filePath,
    compiledFilePath
  );
  if (!code) {
    return render(compiledComponent(props));
  }
  const compiledComponentCode = await Compile(code);
  try {
    await writeNestedFile(compiledFilePath, compiledComponentCode);
    moduleLastUpdates[compiledFilePath] = new Date();
  } catch (e) {
    console.error("cannot save compiled jsx code for :", filePath);
  }
  const compiledComponentFromCode = await importCached(compiledFilePath);
  return render(compiledComponentFromCode(props));
}

async function getCachedCompilation(originalPathForFile, cachePathForFile) {
  try {
    if (preCompile) {
      return {
        code: null,
        compiledComponent: await importCached(cachePathForFile),
      };
    }
    const metadataOfCache =
      moduleLastUpdates[cachePathForFile] || (await stat(cachePathForFile));
    moduleLastUpdates[cachePathForFile] = metadataOfCache;
    const metadataOfOriginal = await stat(originalPathForFile);
    if (
      metadataOfOriginal.mtime.getTime() < metadataOfCache.mtime.getTime() &&
      !forceFreshCompilation
    ) {
      const compiledComponent = await importCached(cachePathForFile);
      return {
        code: null,
        compiledComponent,
      };
    }
    throw "re-compilation needed";
  } catch (e) {
    return {
      code: await readFile(originalPathForFile, "utf-8"),
      compiledComponent: null,
    };
  }
}

async function importCached(compiledFilePath) {
  if (moduleCache[compiledFilePath] && !forceFreshImport)
    return moduleCache[compiledFilePath];
  const { default: Component } = await import(compiledFilePath);
  moduleCache[compiledFilePath] = Component;
  return Component;
}
async function writeNestedFile(filePath, content) {
  // 1. Ensure the directory exists
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });

  // 2. Write the file
  await writeFile(filePath, content, "utf-8");
}
