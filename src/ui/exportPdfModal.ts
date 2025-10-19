import { App, Modal, Setting } from "obsidian";
import PrinterPlugin from "src/main";
import { BrowseTemplateModal } from "./browseTemplatesModal";

export class ExportPdfModal extends Modal {
	constructor(
		app: App,
		templateFilesNames: string[],
		plugin: PrinterPlugin,
		onSubmit: (templateFolderName: string) => Promise<void>
	) {
		super(app);

		this.contentEl.empty();

		this.setTitle("Print PDF");

		let selectedTemplate: string = "Default";
		if (templateFilesNames.length > 0) {
			templateFilesNames.push("Default");
			const templateSetting = new Setting(this.contentEl)
				.setName("Template")
				.setDesc("Selected template: " + selectedTemplate)
				.addButton((btn) => {
					btn.setButtonText("Select");
					btn.onClick(async () => {
						new BrowseTemplateModal(
							templateFilesNames,
							plugin,
							(template) => {
								selectedTemplate = template;
								templateSetting.setDesc(
									"Selected template: " + selectedTemplate
								);
							}
						).open();
					});
				});
		} else {
			new Setting(this.contentEl)
				.setName("Template")
				.setDesc(
					"No custom templates installed. Using default template."
				);
		}

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Print")
				.setCta()
				.onClick(() => {
					this.close();
					onSubmit(selectedTemplate);
				})
		);
	}
}
