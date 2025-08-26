
export async function Compile(code = "") {
  console.warn(
    "⚠ Templates already precompiled. If you add new templates, run 'npx easy_mailer precompile <dir>'"
  );
  return code;
}
