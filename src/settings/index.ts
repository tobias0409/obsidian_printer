import { PluginSettingTab, Setting } from "obsidian";
import Printer from "src/main";
import { FolderSuggest } from "./suggesters/FolderSuggester";

export const registerSettingsTab = (plugin: Printer) => {
	plugin.addSettingTab(new SettingTab(plugin));
};

export interface PrinterSettings {
	templatesFolder: string;
	fontsFolder: string;
	isOverwrite: boolean;
}

export const DEFAULT_SETTINGS: PrinterSettings = {
	templatesFolder: "",
	fontsFolder: "",
	isOverwrite: true,
};

export class SettingTab extends PluginSettingTab {
	plugin: Printer;

	constructor(plugin: Printer) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Templates" });

		new Setting(containerEl)
			.setName("Template folder location")
			.setDesc("Files in this folder will be available as templates.")
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.templatesFolder)
					.onChange((newFolder) => {
						newFolder = newFolder.trim();
						newFolder = newFolder.replace(/\/$/, "");

						this.plugin.settings.templatesFolder = newFolder;
						this.plugin.saveSettings();
					});
				// @ts-ignore
				cb.containerEl.addClass("folder-suggester");
			});

		new Setting(containerEl)
			.setName("Fonts folder location")
			.setDesc("Fonts in this folder will be loaded during printing.")
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.fontsFolder)
					.onChange((newFolder) => {
						newFolder = newFolder.trim();
						newFolder = newFolder.replace(/\/$/, "");

						this.plugin.settings.fontsFolder = newFolder;
						this.plugin.saveSettings();
					});
				// @ts-ignore
				cb.containerEl.addClass("folder-suggester");
			});
	}
}
