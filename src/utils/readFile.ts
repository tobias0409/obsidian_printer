import { TAbstractFile, TFile } from "obsidian";
import Printer from "src/main";

export const readFile = async (
	file: TAbstractFile,
	plugin: Printer
): Promise<string> => {
	if (file instanceof TFile) {
		const content = await plugin.app.vault.read(file);
		return content;
	} else {
		throw new Error("File is not a Typst file or does not exist.");
	}
};
