import { normalizePath } from "obsidian";
import PrinterPlugin from "src/main";

export const listTemplates = async (
	plugin: PrinterPlugin,
): Promise<string[]> => {
	const templateFolder = (plugin.settings.templatesFolder || "").trim();
	if (!templateFolder) return [];

	const adapter = plugin.app.vault.adapter;
	if (!(await adapter.exists(templateFolder))) return [];

	const listing = await adapter.list(templateFolder);
	const result: string[] = [];

	for (const folderPath of listing.folders) {
		const dir = await adapter.list(folderPath);
		const expected = normalizePath(`${folderPath}/template.md`);
		const hasTemplateTyp = dir.files.map(normalizePath).includes(expected);
		if (hasTemplateTyp) {
			const name =
				folderPath.split("/").filter(Boolean).pop() ?? folderPath;
			result.push(name);
		}
	}
	return result;
};
