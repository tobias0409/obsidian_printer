import { Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	PrinterSettings,
	registerSettingsTab,
} from "./settings";
import { fetchPandocWasm, fetchTypstWasm } from "./utils/fetchWasm";
import {
	PLUGIN_DIR,
	PLUGIN_NAME,
	TYPST_TS_VERSION,
	WASM_PANDOC_VERSION,
} from "./utils/constants";
import { registerEvents } from "./events";

export default class PrinterPlugin extends Plugin {
	settings: PrinterSettings;

	async onload() {
		/*
			Initialization pandoc and typst.ts Compiler / Renderer
		*/
		await initPluginFiles(this);

		/*
			Load default settings
		*/
		await this.loadSettings();

		/*
			Register Settings Tab
		*/
		registerSettingsTab(this);

		/*
			Register Events
		*/
		registerEvents(this);
	}

	onunload() {
		/* Nothing to clean up yet */
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async resetSettings() {
		this.settings = DEFAULT_SETTINGS;
		this.saveSettings();
		new Notice(`${PLUGIN_NAME}: plugin settings reset`);
	}
}

// only works for typst so for / will use it from the github release later on
const initPluginFiles = async (plugin: PrinterPlugin) => {
	resetVersionFolder(
		plugin,
		`${PLUGIN_DIR(plugin)}/assets/wasm/typst-ts`,
		TYPST_TS_VERSION
	);
	try {
		// Fetch the WASM files for the Typst compiler and renderer
		await fetchTypstWasm(plugin);
	} catch (error) {
		new Notice(
			`${PLUGIN_NAME} Failed to download the Typst compiler/renderer. Please check your internet connection or try again later.`,
			5000
		);
		console.error("Typst compiler download failed:", error);
	}

	// Create folder for pandoc assets if it doesn't exist
	await plugin.app.vault.adapter.mkdir(
		`${PLUGIN_DIR(plugin)}/assets/wasm/pandoc`
	);

	resetVersionFolder(
		plugin,
		`${PLUGIN_DIR(plugin)}/assets/wasm/pandoc`,
		WASM_PANDOC_VERSION
	);
	try {
		// Fetch the WASM files for pandoc
		await fetchPandocWasm(plugin);
	} catch (error) {
		new Notice(
			`${PLUGIN_NAME} Failed to download pandoc. Please check your internet connection or try again later.`,
			5000
		);
		console.error("Pandoc download failed:", error);
	}
};

const resetVersionFolder = async (
	plugin: PrinterPlugin,
	path: string,
	version: string
) => {
	// Create folder for assets if it doesn't exist
	await plugin.app.vault.adapter.mkdir(path);

	// Check if the version folder exists
	const pandocVersionFolder = await plugin.app.vault.adapter.exists(
		`${path}/${version}`
	);

	if (!pandocVersionFolder) {
		// Delete everything in the pandoc to only keep the latest version
		const pandocFolder = await plugin.app.vault.adapter.list(path);

		if (pandocFolder) {
			for (const folder of pandocFolder.folders) {
				await plugin.app.vault.adapter.rmdir(folder, true);
			}
		}

		// Create the version folder
		await plugin.app.vault.adapter.mkdir(`${path}/${version}`);
	}
};
