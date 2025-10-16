import { App, Modal } from "obsidian";

export class ExportPdfModal extends Modal {
	constructor(app: App) {
		super(app);
		this.setContent("Look at me, I'm a modal! 👀");
	}
}
