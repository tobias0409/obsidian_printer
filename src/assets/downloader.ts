import { Notice, requestUrl } from "obsidian";
import PrinterPlugin from "src/main";
import {
	PLUGIN_DIR,
	PLUGIN_NAME,
	ASSETS_VERSION,
	GITHUB_REPO,
} from "src/utils/constants";

export const installAssets = async (plugin: PrinterPlugin) => {
	const assetsDir = `${PLUGIN_DIR(plugin)}/assets`;
	const currentAssetsVersion = plugin.settings.assetsVersion;

	if (currentAssetsVersion !== ASSETS_VERSION) {
		try {
			if (await plugin.app.vault.adapter.exists(assetsDir)) {
				await plugin.app.vault.adapter.rmdir(assetsDir, true);
			}

			await plugin.app.vault.adapter.mkdir(assetsDir);

			await downloadAndExtractAssets(plugin, plugin.manifest.version);

			plugin.settings.assetsVersion = ASSETS_VERSION;
		} catch (error) {
			new Notice(
				`${PLUGIN_NAME}: Failed to download assets. Please check your internet connection or try again later.`,
				5000
			);
			console.error("Assets download failed:", error);
		}
	}
};

async function downloadAndExtractAssets(
	plugin: PrinterPlugin,
	version: string
) {
	const assetsDir = `${PLUGIN_DIR(plugin)}/assets`;
	const zipUrl = `https://github.com/${GITHUB_REPO}/releases/download/${version}/printer-assets.zip`;

	try {
		const response = await requestUrl({
			url: zipUrl,
			method: "GET",
		});

		if (response.status !== 200) {
			throw new Error(`Failed to download assets: ${response.status}`);
		}

		const JSZip = await import("jszip");
		const zip = await JSZip.loadAsync(response.arrayBuffer);

		const files = Object.keys(zip.files);
		for (const filename of files) {
			const file = zip.files[filename];

			const normalizedPath = filename.startsWith("assets/")
				? filename.substring("assets/".length)
				: filename;

			if (!normalizedPath) continue;

			if (file.dir) {
				await plugin.app.vault.adapter.mkdir(
					`${assetsDir}/${normalizedPath}`
				);
			} else {
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
