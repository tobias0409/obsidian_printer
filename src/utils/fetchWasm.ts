import Printer from "src/main";
import { PLUGIN_DIR, TYPST_TS_VERSION } from "./constants";
import { Notice } from "obsidian";
import { writeFile } from "./writeFile";
import PrinterPlugin from "src/main";

export const fetchPandocWasm = async (plugin: Printer): Promise<void> => {
	// Adjust it later, use release to download the wasm file
	// Dowload the pandoc wasm
	/* if (
		!(await plugin.app.vault.adapter.exists(
			`${PLUGIN_DIR(
				plugin
			)}/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`
		))
	) {
		new Notice("Downloading Typst compiler...");
		const compilerWASM = await fetch(
			`https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@${TYPST_TS_VERSION}/pkg/typst_ts_web_compiler_bg.wasm`
		);

		if (compilerWASM.status !== 200) {
			throw new Error(
				`Failed to fetch renderer WASM: ${compilerWASM.statusText}`
			);
		}

		const compilerWASMBuffer = await compilerWASM.arrayBuffer();
		await plugin.app.vault.adapter.writeBinary(
			`${PLUGIN_DIR(
				plugin
			)}/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`,
			compilerWASMBuffer
		);
	} */
};

export const fetchTypstWasm = async (plugin: Printer): Promise<void> => {
	// Download the latest wasm files
	// Dowload the typst.ts compiler
	if (
		!(await plugin.app.vault.adapter.exists(
			`${PLUGIN_DIR(
				plugin
			)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`
		))
	) {
		new Notice("Downloading Typst compiler...");
		const compilerWASM = await fetch(
			`https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@${TYPST_TS_VERSION}/pkg/typst_ts_web_compiler_bg.wasm`
		);

		if (compilerWASM.status !== 200) {
			throw new Error(
				`Failed to fetch renderer WASM: ${compilerWASM.statusText}`
			);
		}

		const compilerWASMBuffer = await compilerWASM.arrayBuffer();
		await writeFile(
			`${PLUGIN_DIR(
				plugin
			)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`,
			compilerWASMBuffer,
			plugin
		);
	}

	// Dowload the typst.ts renderer
	if (
		!(await plugin.app.vault.adapter.exists(
			`${PLUGIN_DIR(
				plugin
			)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_renderer_bg.wasm`
		))
	) {
		new Notice("Downloading Typst renderer...");
		const rendererWASM = await fetch(
			`https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@${TYPST_TS_VERSION}/pkg/typst_ts_renderer_bg.wasm`
		);

		if (rendererWASM.status !== 200) {
			throw new Error(
				`Failed to fetch renderer WASM: ${rendererWASM.statusText}`
			);
		}

		const rendererWASMBuffer = await rendererWASM.arrayBuffer();

		await writeFile(
			`${PLUGIN_DIR(
				plugin
			)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_renderer_bg.wasm`,
			rendererWASMBuffer,
			plugin
		);
	}
};

const fetchWasm = async (
	path: string,
	fetchURL: string,
	plugin: PrinterPlugin
) => {
	if (
		!(await plugin.app.vault.adapter.exists(
			`${PLUGIN_DIR(
				plugin
			)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`
		))
	) {
		new Notice("Downloading Typst compiler...");
		const compilerWASM = await fetch(
			`https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@${TYPST_TS_VERSION}/pkg/typst_ts_web_compiler_bg.wasm`
		);

		if (compilerWASM.status !== 200) {
			throw new Error(
				`Failed to fetch renderer WASM: ${compilerWASM.statusText}`
			);
		}

		const compilerWASMBuffer = await compilerWASM.arrayBuffer();
		await writeFile(
			`${PLUGIN_DIR(
				plugin
			)}/assets/wasm/typst-ts/${TYPST_TS_VERSION}/typst_ts_web_compiler_bg.wasm`,
			compilerWASMBuffer,
			plugin
		);
	}
};
