import { PluginSettingTab, Setting } from "obsidian";
import Printer from "src/main";

export const registerSettingsTab = (plugin: Printer) => {
	plugin.addSettingTab(new SettingTab(plugin));
};

export interface PrinterSettings {
	isOverwrite: boolean;
}

export const DEFAULT_SETTINGS: PrinterSettings = {
	isOverwrite: false,
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

		containerEl.createEl("h2", { text: "Printer" }).createEl("p", {
			text: "No settings available.",
			cls: "setting-item-description",
		});
	}
}
