import { PluginSettingTab, Setting } from "obsidian";
import Printer from "src/main";
import { FolderSuggest } from "./suggesters/FolderSuggester";
import { ASSETS_VERSION } from "src/utils/constants";
import { installAssets } from "src/assets";

export const registerSettingsTab = (plugin: Printer) => {
	plugin.addSettingTab(new SettingTab(plugin));
};

export interface PrinterSettings {
	templatesFolder: string;
	fontsFolder: string;
	assetsVersion: string;
	isOverwrite: boolean;
}

export const DEFAULT_SETTINGS: PrinterSettings = {
	templatesFolder: "",
	fontsFolder: "",
	assetsVersion: "",
	isOverwrite: true,
};

export class SettingTab extends PluginSettingTab {
	plugin: Printer;

	constructor(plugin: Printer) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		new Setting(this.containerEl)
			.setName("Assets")
			.setDesc(
				"Download required rendering assets to enable PDF generation. Downloads ~80 MB on first use."
			)
			.addButton((btn) => {
				const currentAssetsVersion = this.plugin.settings.assetsVersion;
				let buttonText = "";
				if (currentAssetsVersion === "") {
					buttonText = "Download";
				} else if (currentAssetsVersion === ASSETS_VERSION) {
					buttonText = "Re-download";
				} else {
					buttonText = "Update";
				}

				btn.setButtonText(buttonText);
				btn.onClick(async () => {
					await installAssets(this.plugin);
				});
				btn.setClass("mod-cta");
			});

		containerEl.createEl("h2", { text: "Templates" });

		new Setting(this.containerEl)
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

		new Setting(this.containerEl)
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
