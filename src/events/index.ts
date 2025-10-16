import { CachedMetadata, Notice, TFile } from "obsidian";
import PrinterPlugin from "src/main";
import { convertMarkdownToTypst } from "src/pandoc";
import { convertTypstToPdf } from "src/typst";
import { readFile } from "src/utils/readFile";
import { writeFile } from "src/utils/writeFile";

export const registerEvents = (plugin: PrinterPlugin) => {
	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", async (menu, file) => {
			if (file.name.endsWith(".md")) {
				menu.addItem((item) => {
					item.setTitle("Printer: Print PDF")
						.setIcon("printer")
						.onClick(async () => {
							try {
								const markdownContent = await readFile(
									file,
									plugin
								);

								const DEFAULT_TEMPLATE = `
#set page(
  margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm),
)

// Red horizontal bar at the top
#align(top)[
  #block(
    width: 100%,
    height: 0.5cm,
    fill: rgb("#dc143c"),
  )
]

#v(1cm)

$body$
`;

								const encoder = new TextEncoder();
								const templateBytes =
									encoder.encode(DEFAULT_TEMPLATE);

								const typstContent =
									await convertMarkdownToTypst(
										plugin,
										markdownContent
									);

								const embeds: Record<
									string,
									Uint8Array<ArrayBufferLike>
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
												new Uint8Array(embedData);
										}
									}
								}

								const pdf = await convertTypstToPdf(
									typstContent,
									embeds,
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
								console.error("Export to PDF failed:", err);
							}
						});
				});
			}
		})
	);
};
