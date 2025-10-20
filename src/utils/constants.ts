import Printer from "src/main";

// Version of Typst
export const TYPST_VERSION = "0.13.1";
// Version of Typst.ts
export const TYPST_TS_VERSION = "0.6.1-rc3";
// Version of wasm-pandoc
export const WASM_PANDOC_VERSION = "0.8.0";

export const ASSETS_VERSION = TYPST_TS_VERSION + "-" + WASM_PANDOC_VERSION;

export const DEFAULT_FONTS = [
	"DejaVuSansMono-Bold.ttf",
	"DejaVuSansMono-BoldOblique.ttf",
	"DejaVuSansMono-Oblique.ttf",
	"DejaVuSansMono.ttf",
	"DejaVuSans-Bold.ttf",
	"DejaVuSans-BoldOblique.ttf",
	"LibertinusSerif-Bold.otf",
	"LibertinusSerif-BoldItalic.otf",
	"LibertinusSerif-Italic.otf",
	"LibertinusSerif-Regular.otf",
	"LibertinusSerif-SemiBold.otf",
	"LibertinusSerif-SemiBoldItalic.otf",
	"NewCM10-Bold.otf",
	"NewCM10-BoldItalic.otf",
	"NewCM10-Italic.otf",
	"NewCM10-Regular.otf",
	"NewCMMath-Bold.otf",
	"NewCMMath-Book.oft",
	"NewCMMath-Regular.otf",
];

export const PLUGIN_NAME = "Printer";
export const PLUGIN_DIR = (plugin: Printer) =>
	`./${plugin.app.vault.configDir}/plugins/${PLUGIN_NAME}`;

export const VIEW_TYPE_PREVIEW = "preview-view";

export const GITHUB_REPO = "tobias0409/obsidian_printer";
