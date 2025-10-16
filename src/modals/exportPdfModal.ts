import { App, Modal, Setting } from "obsidian";
import PrinterPlugin from "src/main";
import { PLUGIN_DIR } from "src/utils/constants";
export class ExportPdfModal extends Modal {
	constructor(
		app: App,
		plugin: PrinterPlugin,
		onSubmit: (templateFolderName: string) => Promise<void>
	) {
		super(app);
		this.setTitle("Export PDF");

		let templateFolderName = "default";
		new Setting(this.contentEl)
			.setName("Template")
			.addDropdown(async (dropdown) => {
				// default - default pandoc standalone template
				dropdown.addOption("default", "Default");

				// assumption: files inside the templates folder are valid
				// TODO: add validation later
				const templatesPath = `${PLUGIN_DIR(plugin)}/templates`;
				try {
					const listing = await app.vault.adapter.list(templatesPath);

					for (const folderPath of listing.folders) {
						const folderName = folderPath.split("/").pop();
						if (folderName) {
							dropdown.addOption(folderName, folderName);
						}
					}
				} catch (error) {
					console.error("Failed to list template folders:", error);
				}

				dropdown.setValue("default");
				dropdown.onChange((value) => {
					templateFolderName = value;
				});
			});

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					onSubmit(templateFolderName);
				})
		);
	}
}
