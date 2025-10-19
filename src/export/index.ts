import { Notice, TFile } from "obsidian";
import PrinterPlugin from "src/main";
import { ExportPdfModal } from "src/ui/exportPdfModal";
import { ASSETS_VERSION, PLUGIN_NAME } from "src/utils/constants";
import { readFile, writeFile } from "src/utils/fs";
import { convertMarkdownToTypst } from "./engines/pandoc";
import { convertTypstToPdf, convertTypstToCanvas } from "./engines/typst";
import { listTemplates } from "src/templates";

export const printPdf = async (file: TFile, plugin: PrinterPlugin) => {
	if (plugin.settings.assetsVersion == "") {
		new Notice(
			`${PLUGIN_NAME}: Assets not initialized. Please go to settings and download the assets`,
			5000,
		);
		return;
	}

	if (plugin.settings.assetsVersion != ASSETS_VERSION) {
		new Notice(
			`${PLUGIN_NAME}: Invalid assets version. Please go to settings and update the assets`,
			5000,
		);
		return;
	}

	const embeds: Record<string, Uint8Array> = {};
	if (file instanceof TFile) {
		const cacheMetadata = plugin.app.metadataCache.getFileCache(file);

		for (const embed of cacheMetadata?.embeds ?? []) {
			const embedLink = embed.link;
			const embedFile = plugin.app.metadataCache.getFirstLinkpathDest(
				embedLink,
				file.path,
			);
			if (embedFile && embedFile instanceof TFile) {
				const embedData = await plugin.app.vault.readBinary(embedFile);

				embeds["/" + embedLink] = new Uint8Array(embedData);
			}
		}
	}

	const templateFilesNames = await listTemplates(plugin);

	new ExportPdfModal(
		plugin.app,
		templateFilesNames,
		plugin,
		async (templateFolderName) => {
			let templateFile: Uint8Array;
			let templateImages: Record<string, Uint8Array> = {};

			if (templateFolderName !== "Default") {
				const templateBasePath = `${plugin.settings.templatesFolder}/${templateFolderName}`;

				const resources = await loadTemplateResources(
					plugin,
					templateBasePath,
				);
				templateFile = resources.template;
				templateImages = resources.images;
			} else {
				// Use empty template for default
				templateFile = new Uint8Array();
			}

			try {
				const markdownContent = await readFile(file, plugin);

				const typstContent = await convertMarkdownToTypst(
					plugin,
					markdownContent,
					new Uint8Array(templateFile.slice().buffer),
				);

				// Merge template images and embeds
				const allResources = {
					...templateImages,
					...embeds,
				};

				const pdf = await convertTypstToPdf(
					typstContent,
					allResources,
					plugin,
				);
				const newFile = file.path.replace(".md", ".pdf");

				const buffer = pdf.slice().buffer;
				writeFile(newFile, buffer, plugin);
				new Notice(`Exported ${file.name} to PDF successfully!`);
			} catch (err) {
				console.error("Export to PDF failed:", err);
			}
		},
	).open();
};

export const previewPdf = async (
	file: TFile,
	container: HTMLElement,
	plugin: PrinterPlugin,
) => {
	if (plugin.settings.assetsVersion == "") {
		new Notice(
			`${PLUGIN_NAME}: Assets not initialized. Please go to settings and download the assets`,
			5000,
		);
		return;
	}

	if (plugin.settings.assetsVersion != ASSETS_VERSION) {
		new Notice(
			`${PLUGIN_NAME}: Invalid assets version. Please go to settings and update the assets`,
			5000,
		);
		return;
	}

	const embeds: Record<string, Uint8Array> = {};
	if (file instanceof TFile) {
		const cacheMetadata = plugin.app.metadataCache.getFileCache(file);

		for (const embed of cacheMetadata?.embeds ?? []) {
			const embedLink = embed.link;
			const embedFile = plugin.app.metadataCache.getFirstLinkpathDest(
				embedLink,
				file.path,
			);
			if (embedFile && embedFile instanceof TFile) {
				const embedData = await plugin.app.vault.readBinary(embedFile);

				embeds["/" + embedLink] = new Uint8Array(embedData);
			}
		}
	}

	const markdownContent = await readFile(file, plugin);

	const typstContent = await convertMarkdownToTypst(
		plugin,
		markdownContent,
		new Uint8Array(),
	);

	// Merge template images and embeds
	const allResources = {
		...embeds,
	};

	const canvas = await convertTypstToCanvas(
		typstContent,
		allResources,
		container,
		plugin,
	);
	return canvas;
};

interface TemplateResources {
	template: Uint8Array;
	images: Record<string, Uint8Array>;
}

async function loadTemplateResources(
	plugin: PrinterPlugin,
	templateBasePath: string,
): Promise<TemplateResources> {
	// Load template.typ from root
	const templatePath = `${templateBasePath}/template.typ`;
	const templateContent =
		await plugin.app.vault.adapter.readBinary(templatePath);
	const template = new Uint8Array(templateContent);

	const images: Record<string, Uint8Array> = {};

	// Load images from /images folder (direct children only, no recursion)
	const imagesPath = `${templateBasePath}/images`;
	try {
		const imagesListing = await plugin.app.vault.adapter.list(imagesPath);
		for (const imagePath of imagesListing.files) {
			const imageContent =
				await plugin.app.vault.adapter.readBinary(imagePath);
			const fileName = imagePath.split("/").pop();
			if (fileName) {
				images[`/images/${fileName}`] = new Uint8Array(imageContent);
			}
		}
	} catch (err) {
		console.log("No images folder found or empty");
	}

	return { template, images };
}
