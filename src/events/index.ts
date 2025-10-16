import { Notice, TFile } from "obsidian";
import PrinterPlugin from "src/main";
import { ExportPdfModal } from "src/modals/exportPdfModal";
import { convertMarkdownToTypst } from "src/pandoc";
import { convertTypstToPdf } from "src/typst";
import { PLUGIN_DIR, PLUGIN_NAME } from "src/utils/constants";
import { readFile } from "src/utils/readFile";
import { writeFile } from "src/utils/writeFile";

export const registerEvents = (plugin: PrinterPlugin) => {
	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", async (menu, file) => {
			if (file.name.endsWith(".md")) {
				menu.addItem((item) => {
					item.setTitle(`${PLUGIN_NAME}: Print PDF`)
						.setIcon("printer")
						.onClick(async () => {
							new ExportPdfModal(
								plugin.app,
								plugin,
								async (templateFolderName) => {
									let templateFile: Uint8Array;
									let templateImages: Record<
										string,
										Uint8Array
									> = {};

									if (templateFolderName !== "default") {
										const templateBasePath = `${PLUGIN_DIR(
											plugin
										)}/templates/${templateFolderName}`;

										const resources =
											await loadTemplateResources(
												plugin,
												templateBasePath
											);
										templateFile = resources.template;
										templateImages = resources.images;
									} else {
										// Use empty template for default
										templateFile = new Uint8Array();
									}

									try {
										const markdownContent = await readFile(
											file,
											plugin
										);

										const typstContent =
											await convertMarkdownToTypst(
												plugin,
												markdownContent,
												new Uint8Array(
													templateFile.slice().buffer
												)
											);

										const embeds: Record<
											string,
											Uint8Array
										> = {};
										if (file instanceof TFile) {
											const cacheMetadata =
												plugin.app.metadataCache.getFileCache(
													file
												);

											for (const embed of cacheMetadata?.embeds ??
												[]) {
												const embedLink = embed.link;
												const embedFile =
													plugin.app.metadataCache.getFirstLinkpathDest(
														embedLink,
														file.path
													);
												if (
													embedFile &&
													embedFile instanceof TFile
												) {
													const embedData =
														await plugin.app.vault.readBinary(
															embedFile
														);

													embeds["/" + embedLink] =
														new Uint8Array(
															embedData
														);
												}
											}
										}

										// Merge template images and embeds
										const allResources = {
											...templateImages,
											...embeds,
										};

										const pdf = await convertTypstToPdf(
											typstContent,
											allResources,
											plugin
										);
										const pdfPath = file.path.replace(
											".md",
											".pdf"
										);

										const buffer = pdf.slice().buffer;
										writeFile(pdfPath, buffer, plugin);
										new Notice(
											`Exported ${file.name} to PDF successfully!`
										);
									} catch (err) {
										console.error(
											"Export to PDF failed:",
											err
										);
									}
								}
							).open();
						});
				});
			}
		})
	);
};

interface TemplateResources {
	template: Uint8Array;
	images: Record<string, Uint8Array>;
}

/**
 * Load template resources from the template folder structure:
 * - template.typ in root
 * - images in /images folder (direct children only)
 */
async function loadTemplateResources(
	plugin: PrinterPlugin,
	templateBasePath: string
): Promise<TemplateResources> {
	// Load template.typ from root
	const templatePath = `${templateBasePath}/template.typ`;
	const templateContent = await plugin.app.vault.adapter.readBinary(
		templatePath
	);
	const template = new Uint8Array(templateContent);

	const images: Record<string, Uint8Array> = {};

	// Load images from /images folder (direct children only, no recursion)
	const imagesPath = `${templateBasePath}/images`;
	try {
		const imagesListing = await plugin.app.vault.adapter.list(imagesPath);
		for (const imagePath of imagesListing.files) {
			const imageContent = await plugin.app.vault.adapter.readBinary(
				imagePath
			);
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
