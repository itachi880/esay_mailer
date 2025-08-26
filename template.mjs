import { mkdir, readFile, stat, writeFile } from "fs/promises";
import render from "preact-render-to-string";
import { Compile } from "./Compiler.mjs";
import {
  forceFreshImport,
  preCompile,
  forceFreshCompilation,
} from "./constants.mjs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caches for compiled modules
const moduleCache = {};
const moduleLastUpdates = {};

/**
 * Render a JSX template file with props.
 */
export async function renderTemplate(filePath, props = {}) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const compiledFilePath = path.join(
    __dirname,
    "compiled-Templates",
    `${fileName}.mjs`
  );

  const { code, compiledComponent } = await getCachedCompilation(
    filePath,
    compiledFilePath
  );

  if (!code) {
    // Already compiled
    return render(compiledComponent(props));
  }

  // Compile fresh code
  const compiledComponentCode = await Compile(code);
  try {
    await writeNestedFile(compiledFilePath, compiledComponentCode);
    moduleLastUpdates[compiledFilePath] = new Date();
  } catch (e) {
    console.error("Cannot save compiled JSX code for:", filePath, e);
  }

  const compiledComponentFromCode = await importCached(compiledFilePath);
  return render(compiledComponentFromCode(props));
}

/**
 * Check cache and decide whether to recompile
 */
async function getCachedCompilation(originalPath, cachePath) {
  try {
    if (preCompile) {
      return {
        code: null,
        compiledComponent: await importCached(cachePath),
      };
    }

    const metadataOfCache =
      moduleLastUpdates[cachePath] || (await stat(cachePath));
    moduleLastUpdates[cachePath] = metadataOfCache;
    const metadataOfOriginal = await stat(originalPath);

    if (
      metadataOfOriginal.mtime.getTime() < metadataOfCache.mtime.getTime() &&
      !forceFreshCompilation
    ) {
      const compiledComponent = await importCached(cachePath);
      return { code: null, compiledComponent };
    }

    throw "re-compilation needed";
  } catch (e) {
    return {
      code: await readFile(originalPath, "utf-8"),
      compiledComponent: null,
    };
  }
}

/**
 * Import a compiled component safely with caching
 */
async function importCached(compiledFilePath) {
  if (moduleCache[compiledFilePath] && !forceFreshImport) {
    return moduleCache[compiledFilePath];
  }

  // Convert path to file:// URL for dynamic import
  const fileUrl = pathToFileURL(path.resolve(compiledFilePath)).href;
  const { default: Component } = await import(fileUrl);

  moduleCache[compiledFilePath] = Component;
  return Component;
}

/**
 * Write file ensuring nested directories exist
 */
async function writeNestedFile(filePath, content) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, "utf-8");
}
