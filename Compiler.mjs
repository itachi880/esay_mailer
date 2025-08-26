import { transformAsync } from "@babel/core";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function Compile(code = "") {
  const requireFromPackage = createRequire(
    path.resolve(__dirname, "package.json")
  );
  const presetReactPath = requireFromPackage.resolve("@babel/preset-react");

  const { code: compiledCode } = await transformAsync(code, {
    presets: [
      [presetReactPath, { runtime: "automatic", importSource: "preact" }],
    ],
  });
  return compiledCode;
}
