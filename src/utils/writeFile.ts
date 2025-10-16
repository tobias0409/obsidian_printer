import Printer from "src/main";

export const writeFile = async (
	path: string,
	binary: ArrayBuffer,
	plugin: Printer
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
