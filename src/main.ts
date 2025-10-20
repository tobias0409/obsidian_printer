import { Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	PrinterSettings,
	registerSettingsTab,
} from "./settings";
import { PLUGIN_NAME } from "./utils/constants";
import { registerEvents } from "./events";
import { registerCommands } from "./commands";

export default class PrinterPlugin extends Plugin {
	settings: PrinterSettings;

	async onload() {
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

		/*
			Register Commands
		*/
		registerCommands(this);

		/*
			Register View
		*/
		//registerPreviewView(this);
	}

	onunload() {
		/* Nothing to clean up yet */
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
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
