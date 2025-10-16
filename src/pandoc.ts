import {
	ConsoleStdout,
	File,
	OpenFile,
	PreopenDirectory,
	WASI,
} from "@bjorn3/browser_wasi_shim";
import { PLUGIN_DIR, WASM_PANDOC_VERSION } from "./utils/constants";
import PrinterPlugin from "./main";

type WasmExports = {
	memory: WebAssembly.Memory;
	malloc: (n: number) => number;
	hs_init_with_rtsopts: (argcPtr: number, argvPtr: number) => void;
	wasm_main: (argsPtr: number, argsLen: number) => void;
	__wasm_call_ctors: () => void;
	[key: string]: any;
};

type WasmInstance = WebAssembly.Instance & { exports: WasmExports };

export const convertMarkdownToTypst = async (
	plugin: PrinterPlugin,
	markdownContent: string,
	template?: Uint8Array<ArrayBuffer>
): Promise<string> => {
	const wasmFile = await plugin.app.vault.adapter.readBinary(
		`${PLUGIN_DIR(
			plugin
		)}/assets/wasm/pandoc/${WASM_PANDOC_VERSION}/pandoc.wasm`
	);

	const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];
	const env: string[] = [];

	const inFile = new File(new Uint8Array(), { readonly: true });
	const outFile = new File(new Uint8Array(), { readonly: false });

	let templateFile;

	if (template) {
		templateFile = new File(template, { readonly: true });
	}

	const wasi = createWasi(args, env, inFile, outFile, templateFile);

	const instance = await instantiateWasm(wasmFile, wasi);

	// perform wasm / runtime initialization
	instance.exports.__wasm_call_ctors();
	initializeHsRts(instance, args);

	// small helper to run conversions
	const run = (argsStr: string, input: string) =>
		invokePandoc(instance, inFile, outFile, argsStr, input);

	const result = run(
		`${
			template
				? `-f markdown -t typst -s --template=/template.typ`
				: `-f markdown -t typst -s`
		}`,
		markdownContent
	);
	return result;
};

function createWasi(
	args: string[],
	env: string[],
	inFile: File,
	outFile: File,
	templateFile?: File
) {
	const fds = [
		new OpenFile(new File(new Uint8Array(), { readonly: true })), // fd 0 (stdin)
		ConsoleStdout.lineBuffered((msg) =>
			console.log(`[WASI stdout] ${msg}`)
		), // fd 1
		ConsoleStdout.lineBuffered((msg) =>
			console.warn(`[WASI stderr] ${msg}`)
		), // fd 2
		new PreopenDirectory(
			"/",
			new Map([
				["in", inFile],
				["out", outFile],
				...(templateFile
					? [["template.typ", templateFile] as const]
					: []),
			])
		),
	];

	return new WASI(args, env, fds, { debug: false });
}

async function instantiateWasm(
	wasmFile: ArrayBuffer,
	wasi: WASI
): Promise<WasmInstance> {
	// instantiateStreaming is preferred when available
	/* const resp = await fetch(wasmUrl);
		if (!resp.ok) {
			throw new Error(
				`Failed to fetch wasm at ${wasmUrl}: ${resp.status}`
			);
		} */

	// instantiate from bytes to be robust across environments
	//const bytes = await resp.arrayBuffer();
	const { instance } = (await WebAssembly.instantiate(wasmFile, {
		wasi_snapshot_preview1: wasi.wasiImport,
	})) as WebAssembly.WebAssemblyInstantiatedSource;

	const wasmInstance = instance as WasmInstance;
	wasi.initialize(wasmInstance);
	return wasmInstance;
}

function initializeHsRts(instance: WasmInstance, args: string[]) {
	const mem = new DataView(instance.exports.memory.buffer);
	const encoder = new TextEncoder();

	// argc pointer stores argc value
	const argcPtr = instance.exports.malloc(4);
	mem.setUint32(argcPtr, args.length, true);

	// argv array (pointers)
	const argv = instance.exports.malloc(4 * (args.length + 1));
	for (let i = 0; i < args.length; ++i) {
		const bytes = encoder.encode(args[i]);
		const argPtr = instance.exports.malloc(bytes.length + 1);
		new Uint8Array(
			instance.exports.memory.buffer,
			argPtr,
			bytes.length
		).set(bytes);
		mem.setUint8(argPtr + bytes.length, 0); // null terminator
		mem.setUint32(argv + 4 * i, argPtr, true);
	}
	// null-terminate argv list
	mem.setUint32(argv + 4 * args.length, 0, true);

	const argvPtr = instance.exports.malloc(4);
	mem.setUint32(argvPtr, argv, true);

	// initialize Haskell RTS with argc/argv pointers
	instance.exports.hs_init_with_rtsopts(argcPtr, argvPtr);
}

function invokePandoc(
	instance: WasmInstance,
	inFile: File,
	outFile: File,
	argsStr: string,
	inStr: string
): string {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder("utf-8", { fatal: true });

	const argsBytes = encoder.encode(argsStr);
	const argsPtr = instance.exports.malloc(argsBytes.length);
	new Uint8Array(
		instance.exports.memory.buffer,
		argsPtr,
		argsBytes.length
	).set(argsBytes);

	// provide input
	inFile.data = encoder.encode(inStr);

	// call wasm entry: pointer + length
	instance.exports.wasm_main(argsPtr, argsBytes.length);

	// read output
	return decoder.decode(outFile.data);
}
