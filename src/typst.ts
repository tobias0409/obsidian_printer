import {
	createTypstCompiler,
	MemoryAccessModel,
	$typst as typst,
} from "@myriaddreamin/typst.ts";
import { Notice } from "obsidian";
import { PLUGIN_DIR, TYPST_TS_VERSION } from "./utils/constants";
import PrinterPlugin from "./main";
import { withAccessModel } from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";

export const convertTypstToPdf = async (
	typstContent: string,
	embeds: Record<string, Uint8Array<ArrayBufferLike>>,
	plugin: PrinterPlugin
): Promise<Uint8Array<ArrayBufferLike>> => {
	const wasmFile = await plugin.app.vault.adapter.readBinary(
		`${PLUGIN_DIR(
			plugin
		)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`
	);

	const mainFileName = "/main.typ";
	const compiler = createTypstCompiler();
	await compiler.init({
		beforeBuild: [withAccessModel(new MemoryAccessModel())],
		getModule: () => wasmFile,
	});
	compiler.addSource(mainFileName, typstContent);

	// Add embedded files to the compiler
	for (const [fileName, fileContent] of Object.entries(embeds)) {
		compiler.mapShadow(fileName, fileContent);
	}

	const compileResult = await compiler.compile({
		mainFilePath: mainFileName,
		format: "pdf",
	});
	const pdf = compileResult.result;

	if (!pdf) {
		new Notice("Failed to convert typst to PDF.");
		throw new Error("PDF generation failed");
	}

	return pdf;
};
