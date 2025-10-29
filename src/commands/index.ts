import { TFile } from "obsidian";
import { printPdf } from "src/export";
import PrinterPlugin from "src/main";

export const registerCommands = (plugin: PrinterPlugin) => {
	plugin.addCommand({
		id: `print-pdf`,
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
};
