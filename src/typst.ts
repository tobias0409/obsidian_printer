import {
	createTypstCompiler,
	MemoryAccessModel,
} from "@myriaddreamin/typst.ts";
import { Notice } from "obsidian";
import { PLUGIN_DIR, TYPST_TS_VERSION } from "./utils/constants";
import PrinterPlugin from "./main";
import {
	disableDefaultFontAssets,
	preloadRemoteFonts,
	withAccessModel,
} from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";

export const convertTypstToPdf = async (
	typstContent: string,
	allResources: Record<string, Uint8Array>,
	plugin: PrinterPlugin
): Promise<Uint8Array> => {
	const wasmFile = await plugin.app.vault.adapter.readBinary(
		`${PLUGIN_DIR(
			plugin
		)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`
	);

	const bundledFonts: Uint8Array[] = [];
	const fontsPath = `${PLUGIN_DIR(plugin)}/assets/fonts`;
	try {
		const fontsListing = await plugin.app.vault.adapter.list(fontsPath);
		for (const fontPath of fontsListing.files) {
			const fontContent = await plugin.app.vault.adapter.readBinary(
				fontPath
			);
			bundledFonts.push(new Uint8Array(fontContent));
		}
	} catch (err) {
		console.log("No bundled fonts folder found or empty");
	}

	const mainFileName = "/main.typ";
	const compiler = createTypstCompiler();
	await compiler.init({
		beforeBuild: [
			withAccessModel(new MemoryAccessModel()),
			disableDefaultFontAssets(),
			preloadRemoteFonts(bundledFonts),
		],
		getModule: () => wasmFile,
	});
	compiler.addSource(mainFileName, typstContent);

	for (const [fileName, fileContent] of Object.entries(allResources)) {
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
