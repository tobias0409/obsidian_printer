import { FileView, ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { previewPdf } from "src/export";
import PrinterPlugin from "src/main";
import { VIEW_TYPE_PREVIEW } from "src/utils/constants";

export const registerPreviewView = (plugin: PrinterPlugin) => {
	plugin.registerView(
		VIEW_TYPE_PREVIEW,
		(leaf) => new PreviewView(leaf, plugin)
	);
};

export class PreviewView extends FileView {
	file: TFile;
	plugin: PrinterPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: PrinterPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_PREVIEW;
	}

	getDisplayText() {
		return "Preview " + this.file?.basename;
	}

	async onLoadFile(file: TFile) {
		this.file = file;
		await this.renderView();
	}

	private async renderView() {
		const container = this.contentEl;
		container.empty();

		// Sticky header with reload icon button at top right
		const headerEl = container.createDiv({
			cls: "printer-preview-header",
		});

		const refreshButton = headerEl.createEl("button", {
			cls: "printer-preview-refresh-button",
			attr: { "aria-label": "Reload preview" },
		});

		// Add reload icon (Lucide icon used by Obsidian)
		refreshButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;

		refreshButton.onClickEvent(async () => {
			await this.renderView();
		});

		const typstAppContainer = container.createDiv({
			attr: { id: "typst-app-container" },
		});

		const typstApp = typstAppContainer.createDiv({
			attr: { id: "typst-app" },
		});

		const loadingEl = typstApp.createEl("div", {
			text: "Rendering preview...",
			cls: "printer-preview-loading",
		});

		// Render async without blocking
		this.renderPreview(typstApp, loadingEl).catch((err) => {
			loadingEl.setText(`Failed to render preview: ${err.message}`);
			console.error("Preview render failed:", err);
		});
	}

	private async renderPreview(
		container: HTMLElement,
		loadingEl: HTMLElement
	) {
		try {
			await previewPdf(this.file, container, this.plugin);
			loadingEl.remove();
		} catch (err) {
			loadingEl.setText(`Failed to render preview: ${err.message}`);
			console.error("Preview render failed:", err);
		}
	}

	async onClose() {
		// Nothing to clean up.
	}
}
