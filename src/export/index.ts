import { Notice, TFile } from "obsidian";
import PrinterPlugin from "src/main";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { readFile } from "src/utils/fs";
import { Converter } from "./Converter";

// TODO:
// 1. Parse markdown file to mdast
// 2. Convert mdast to paget (superset to pdfmake)
// 3. Read template and replace it by $body$ placeholder
// 4. Define and read the default transformer functions
// 5. Read the custom transformer functions and overwrite it
// 6. Replace nodes by transformer functions
// 7. Read image source and replace it with base64 encoding
// 8. Load fonts
// 9. Print to pdf

export const printPdf = async (file: TFile, plugin: PrinterPlugin) => {
	new Notice("Printing PDF...");

	// 1.
	const fileContent = await readFile(file, plugin);
	const mdast = unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkGfm)
		.parse(fileContent);

	console.log(mdast);

	// 2.
	//const pagetSource = convertMdastToPaget(mdast);
	//console.log(pagetSource);
	const converter = new Converter(mdast);
	console.log(converter.convert());
};
