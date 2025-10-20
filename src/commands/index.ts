import { TFile } from "obsidian";
import { printPdf } from "src/export";
import PrinterPlugin from "src/main";
import { PLUGIN_NAME } from "src/utils/constants";

export const registerCommands = (plugin: PrinterPlugin) => {
	plugin.addCommand({
		id: `${PLUGIN_NAME.toLowerCase()}-print-pdf`,
		name: `Print PDF`,
		checkCallback: (checking: boolean) => {
			const currentFile = plugin.app.workspace.getActiveFile();

			if (
				currentFile instanceof TFile &&
				currentFile.name.endsWith(".md")
			) {
				if (!checking) {
					printPdf(currentFile, plugin);
				}
				return true;
			}

			return false;
		},
	});

	/*
	plugin.addCommand({
		id: `${PLUGIN_NAME.toLowerCase()}-preview-pdf`,
		name: `Preview PDF`,
		checkCallback: (checking: boolean) => {
			const currentFile = plugin.app.workspace.getActiveFile();

			if (
				currentFile instanceof TFile &&
				currentFile.name.endsWith(".md")
			) {
				if (!checking) {
					const leaf = plugin.app.workspace.getRightLeaf(false);
					if (leaf) {
						leaf.setViewState({
							type: VIEW_TYPE_PREVIEW,
							active: true,
							state: { file: currentFile.path },
						});
						plugin.app.workspace.revealLeaf(leaf);
					}
				}
				return true;
			}

			return false;
		},
	});
	*/
};
