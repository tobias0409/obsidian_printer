import Printer from "src/main";

// Version of Typst
export const TYPST_VERSION = "0.13.1";
// Version of Typst.ts
export const TYPST_TS_VERSION = "0.6.0";
// Version of wasm-pandoc
export const WASM_PANDOC_VERSION = "0.8.0";

export const PLUGIN_NAME = "printer";
export const PLUGIN_DIR = (plugin: Printer) =>
	`./${plugin.app.vault.configDir}/plugins/${PLUGIN_NAME}`;
