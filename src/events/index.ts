import { TFile } from "obsidian";
import { printPdf } from "src/export";
import PrinterPlugin from "src/main";
import { PLUGIN_NAME } from "src/utils/constants";

export const registerEvents = (plugin: PrinterPlugin) => {
	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", async (menu, file) => {
			if (file instanceof TFile && file.name.endsWith(".md")) {
				menu.addItem((item) => {
					item.setTitle(`${PLUGIN_NAME}: Print PDF`)
						.setIcon("printer")
						.onClick(async () => {
							await printPdf(file, plugin);
						});
				});
			}
		})
	);
};
