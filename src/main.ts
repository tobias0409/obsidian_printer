import { Notice, Plugin, requestUrl } from "obsidian";
import {
	DEFAULT_SETTINGS,
	PrinterSettings,
	registerSettingsTab,
} from "./settings";
import { GITHUB_REPO, PLUGIN_DIR, PLUGIN_NAME } from "./utils/constants";
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

const initPluginFiles = async (plugin: PrinterPlugin) => {
	const assetsDir = `${PLUGIN_DIR(plugin)}/assets`;
	const versionFile = `${assetsDir}/.version`;
	const pluginVersion = plugin.manifest.version;

	// Check if assets exist and are up-to-date
	const versionExists = await plugin.app.vault.adapter.exists(versionFile);
	let currentVersion = "";

	if (versionExists) {
		currentVersion = await plugin.app.vault.adapter.read(versionFile);
	}

	// Download assets if missing or outdated
	if (currentVersion !== pluginVersion) {
		try {
			// Clear old assets
			if (await plugin.app.vault.adapter.exists(assetsDir)) {
				await plugin.app.vault.adapter.rmdir(assetsDir, true);
			}

			// Create assets directory
			await plugin.app.vault.adapter.mkdir(assetsDir);

			// Download and extract new assets
			await downloadAndExtractAssets(plugin, pluginVersion);

			// Write version file
			await plugin.app.vault.adapter.write(versionFile, pluginVersion);
		} catch (error) {
			new Notice(
				`${PLUGIN_NAME}: Failed to download assets. Please check your internet connection or try again later.`,
				5000
			);
			console.error("Assets download failed:", error);
		}
	}

	// Create template folder if it doesn't exist
	await plugin.app.vault.adapter.mkdir(`${PLUGIN_DIR(plugin)}/templates`);
};

async function downloadAndExtractAssets(
	plugin: PrinterPlugin,
	version: string
) {
	const assetsDir = `${PLUGIN_DIR(plugin)}/assets`;
	const zipUrl = `https://github.com/${GITHUB_REPO}/releases/download/${version}/printer-assets-${version}.zip`;

	try {
		// Download the ZIP file
		const response = await requestUrl({
			url: zipUrl,
			method: "GET",
		});

		if (response.status !== 200) {
			throw new Error(`Failed to download assets: ${response.status}`);
		}

		// Use JSZip to extract
		const JSZip = await import("jszip");
		const zip = await JSZip.loadAsync(response.arrayBuffer);

		// Extract all files
		const files = Object.keys(zip.files);
		for (const filename of files) {
			const file = zip.files[filename];

			const normalizedPath = filename.startsWith("assets/")
				? filename.substring("assets/".length)
				: filename;

			// Skip empty paths after normalization
			if (!normalizedPath) continue;

			if (file.dir) {
				// Create directory
				await plugin.app.vault.adapter.mkdir(
					`${assetsDir}/${normalizedPath}`
				);
			} else {
				// Extract file
				const content = await file.async("uint8array");
				await plugin.app.vault.adapter.writeBinary(
					`${assetsDir}/${normalizedPath}`,
					content.slice().buffer
				);
			}
		}

		new Notice(`${PLUGIN_NAME}: Assets downloaded successfully`);
	} catch (error) {
		console.error("Failed to download assets:", error);
		throw error;
	}
}
