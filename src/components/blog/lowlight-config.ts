/**
 * Lowlight configuration for TipTap's CodeBlockLowlight extension.
 *
 * We register only the most common languages to keep the client bundle small.
 * Unknown languages fall back to plain text.
 */
import { createLowlight } from "lowlight"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import css from "highlight.js/lib/languages/css"
import json from "highlight.js/lib/languages/json"
import python from "highlight.js/lib/languages/python"
import bash from "highlight.js/lib/languages/bash"
import sql from "highlight.js/lib/languages/sql"
import go from "highlight.js/lib/languages/go"
import rust from "highlight.js/lib/languages/rust"
import java from "highlight.js/lib/languages/java"
import cpp from "highlight.js/lib/languages/cpp"
import markdown from "highlight.js/lib/languages/markdown"
import yaml from "highlight.js/lib/languages/yaml"

export const lowlight = createLowlight()

// Register aliases so the editor recognises both long and short names
lowlight.register("js", javascript)
lowlight.register("javascript", javascript)
lowlight.register("jsx", javascript)
lowlight.register("ts", typescript)
lowlight.register("typescript", typescript)
lowlight.register("tsx", typescript)
lowlight.register("html", xml)
lowlight.register("xml", xml)
lowlight.register("css", css)
lowlight.register("json", json)
lowlight.register("py", python)
lowlight.register("python", python)
lowlight.register("bash", bash)
lowlight.register("sh", bash)
lowlight.register("shell", bash)
lowlight.register("sql", sql)
lowlight.register("go", go)
lowlight.register("rust", rust)
lowlight.register("rs", rust)
lowlight.register("java", java)
lowlight.register("cpp", cpp)
lowlight.register("c++", cpp)
lowlight.register("c", cpp)
lowlight.register("markdown", markdown)
lowlight.register("md", markdown)
lowlight.register("yaml", yaml)
lowlight.register("yml", yaml)
