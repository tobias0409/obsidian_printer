import Printer from "src/main";

export const PLUGIN_NAME = "Printer";
export const PLUGIN_DIR = (plugin: Printer) =>
	`./${plugin.app.vault.configDir}/plugins/${PLUGIN_NAME}`;

export const VIEW_TYPE_PREVIEW = "preview-view";
