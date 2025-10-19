import { TAbstractFile, TFile } from "obsidian";
import PrinterPlugin from "src/main";

export const readFile = async (
	file: TAbstractFile,
	plugin: PrinterPlugin
): Promise<string> => {
	if (file instanceof TFile) {
		try {
			const content = await plugin.app.vault.read(file);
			return content;
		} catch (error) {
			console.error("Failed to read file:", error);
			throw new Error("Failed to read file.");
		}
	} else {
		console.error("File does not exist.");
		throw new Error("File does not exist.");
	}
};

export const writeFile = async (
	path: string,
	binary: ArrayBuffer,
	plugin: PrinterPlugin
): Promise<void> => {
	try {
		const existingFile = plugin.app.vault.getFileByPath(path);
		if (existingFile) {
			await plugin.app.vault.modifyBinary(existingFile, binary);
		} else {
			await plugin.app.vault.createBinary(path, binary);
		}
	} catch (error) {
		console.error("Failed to write to file:", error);
		throw new Error("Failed to write to file.");
	}
};
