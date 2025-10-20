import { setIcon, SuggestModal } from "obsidian";
import PrinterPlugin from "src/main";

export class BrowseTemplateModal extends SuggestModal<string> {
	plugin: PrinterPlugin;
	templateFilesNames: string[];
	onClick: (template: string) => void;

	constructor(
		templateFilesNames: string[],
		plugin: PrinterPlugin,
		onClick: (template: string) => void
	) {
		super(plugin.app);
		this.templateFilesNames = templateFilesNames;
		this.plugin = plugin;
		this.onClick = onClick;
	}

	async getSuggestions(query: string): Promise<string[]> {
		return this.templateFilesNames.filter((template) =>
			template.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(template: string, el: HTMLElement): void {
		const div = el.createEl("div");
		div.style.display = "flex";
		div.style.justifyContent = "space-between";
		div.style.alignItems = "center";

		div.createEl("div", { text: template });
		const button = div.createEl("div", { text: template });
		setIcon(button, "x");
	}

	async onChooseSuggestion(
		template: string,
		evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		this.onClick(template);
	}
}
