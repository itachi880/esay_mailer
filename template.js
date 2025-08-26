import { readFile, stat, writeFile } from "fs/promises";
import { transformAsync } from "@babel/core";
import render from "preact-render-to-string";
// for chachinh on memory
const moduleCache = {};
const moduleLastUpdates = {};
export const forceFreshImport = false;
export const forceFreshCompilation = false;
export const preCompile = true;

export async function renderTemplate(filePath, props = {}, preCompile = false) {
  const filePathAsArray = filePath.split("/");
  const compiledFilePath =
    "./" + filePathAsArray[filePathAsArray.length - 1].split(".")[0] + ".mjs";

  const { code, compiledComponent } = await getCachedCompilation(
    filePath,
    compiledFilePath,
    preCompile
  );
  if (!code) {
    return render(compiledComponent(props));
  }
  const compiledComponentCode = await Compile(code);
  try {
    await saveFile(compiledFilePath, compiledComponentCode);
    moduleLastUpdates[compiledFilePath] = new Date();
  } catch (e) {
    console.error("cannot save compiled jsx code for :", filePath);
  }
  const compiledComponentFromCode = await importCached(compiledFilePath);
  return render(compiledComponentFromCode(props));
}
async function saveFile(filePath, content) {
  await writeFile(filePath, content, "utf-8"); // utf-8 ensures it's a text file
}
async function Compile(code = "") {
  const { code: compiled } = await transformAsync(code, {
    presets: [
      ["@babel/preset-react", { runtime: "automatic", importSource: "preact" }],
    ],
  });
  return compiled;
}

async function getCachedCompilation(
  originalPathForFile,
  cachePathForFile,
  preCompile = false
) {
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
