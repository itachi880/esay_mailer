// template.d.ts

export interface RenderProps {
  [key: string]: any;
}

export interface RenderTemplateOptions {
  /**
   * The path to the JSX template file.
   */
  filePath: string;

  /**
   * Props to pass into the JSX component.
   */
  props?: RenderProps;
}

/**
 * Renders a JSX template file to a HTML string.
 *
 * @example
 * ```ts
 * import { renderTemplate } from "easy_mailer";
 *
 * const html = await renderTemplate("./templates/Welcome.jsx", { name: "itachi880" });
 * console.log(html);
 * ```
 */
export function renderTemplate(
  filePath: string,
  props?: RenderProps
): Promise<string>;
