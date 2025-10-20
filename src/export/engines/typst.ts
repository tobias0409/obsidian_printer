import {
	createTypstCompiler,
	createTypstRenderer,
	MemoryAccessModel,
	TypstCompiler,
	TypstRenderer,
} from "@myriaddreamin/typst.ts";
import { Notice } from "obsidian";
import {
	disableDefaultFontAssets,
	preloadRemoteFonts,
	withAccessModel,
} from "@myriaddreamin/typst.ts/dist/esm/options.init.mjs";
import PrinterPlugin from "src/main";
import { PLUGIN_DIR, TYPST_TS_VERSION } from "src/utils/constants";

export async function initCompiler(
	plugin: PrinterPlugin,
	bundledFonts: Uint8Array[]
): Promise<TypstCompiler> {
	const compilerWasmFile = await plugin.app.vault.adapter.readBinary(
		`${PLUGIN_DIR(
			plugin
		)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`
	);

	const compiler = createTypstCompiler();
	await compiler.init({
		beforeBuild: [
			withAccessModel(new MemoryAccessModel()),
			disableDefaultFontAssets(),
			preloadRemoteFonts(bundledFonts),
		],
		getModule: () => compilerWasmFile,
	});

	return compiler;
}

export async function initRenderer(
	plugin: PrinterPlugin
): Promise<TypstRenderer> {
	const rendererWasmFile = await plugin.app.vault.adapter.readBinary(
		`${PLUGIN_DIR(
			plugin
		)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_renderer_bg.wasm`
	);

	const renderer = createTypstRenderer();
	await renderer.init({
		beforeBuild: [],
		getModule: () => rendererWasmFile,
	});

	return renderer;
}

export async function compileToFormat(
	compiler: TypstCompiler,
	mainFilePath: string,
	format: "pdf" | "vector"
): Promise<Uint8Array | undefined> {
	const result = await compiler.compile({
		mainFilePath,
		format,
	});
	return result.result;
}

export async function renderCanvasFromVector(
	renderer: TypstRenderer,
	vectorData: Uint8Array,
	container: HTMLElement
): Promise<void> {
	await renderer.renderToCanvas({
		artifactContent: vectorData,
		format: "vector",
		container: container,
		pixelPerPt: 4.5,
		backgroundColor: "#ffffff",
	});
}

export const convertTypstToPdf = async (
	typstContent: string,
	allResources: Record<string, Uint8Array>,
	plugin: PrinterPlugin
): Promise<Uint8Array> => {
	const bundledFonts = await getFonts(plugin);

	const mainFileName = "/main.typ";

	const compiler = await initCompiler(plugin, bundledFonts);
	compiler.addSource(mainFileName, typstContent);

	for (const [fileName, fileContent] of Object.entries(allResources)) {
		compiler.mapShadow(fileName, fileContent);
	}

	const pdf = await compileToFormat(compiler, mainFileName, "pdf");

	if (!pdf) {
		new Notice("Failed to convert typst to PDF.");
		throw new Error("PDF generation failed");
	}

	return pdf;
};

export const convertTypstToCanvas = async (
	typstContent: string,
	allResources: Record<string, Uint8Array>,
	container: HTMLElement,
	plugin: PrinterPlugin
): Promise<void> => {
	const bundledFonts = await getFonts(plugin);

	const mainFileName = "/main.typ";

	const compiler = await initCompiler(plugin, bundledFonts);
	compiler.addSource(mainFileName, typstContent);

	for (const [fileName, fileContent] of Object.entries(allResources)) {
		compiler.mapShadow(fileName, fileContent);
	}

	const vectorData = await compileToFormat(compiler, mainFileName, "vector");

	if (!vectorData) {
		new Notice("Failed to convert typst to SVG.");
		throw new Error("PDF generation failed");
	}

	const renderer = await initRenderer(plugin);
	await renderCanvasFromVector(renderer, vectorData, container);
};

export const getFonts = async (plugin: PrinterPlugin) => {
	const bundledFonts: Uint8Array[] = [];
	const staticFonts = await loadFontAssets(
		`${PLUGIN_DIR(plugin)}/assets/fonts`,
		plugin
	);

	let customFonts: Uint8Array[] = [];
	if (plugin.settings.fontsFolder != "") {
		customFonts = await loadFontAssets(
			`./${plugin.settings.fontsFolder}`,
			plugin
		);
	}

	bundledFonts.push(...staticFonts, ...customFonts);
	return bundledFonts;
};

const loadFontAssets = async (
	fontsFolderPath: string,
	plugin: PrinterPlugin
): Promise<Uint8Array[]> => {
	const bundledFonts: Uint8Array[] = [];
	const fontsPath = fontsFolderPath;
	try {
		const fontsListing = await plugin.app.vault.adapter.list(fontsPath);
		for (const fontPath of fontsListing.files) {
			if (
				fontPath.toLowerCase().endsWith(".ttf") ||
				fontPath.toLowerCase().endsWith(".otf")
			) {
				const fontContent = await plugin.app.vault.adapter.readBinary(
					fontPath
				);
				bundledFonts.push(new Uint8Array(fontContent));
			}
		}
		return bundledFonts;
	} catch (err) {
		console.log("No bundled fonts folder found or empty");
		return [];
	}
};
