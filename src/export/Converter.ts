import type {
	Root,
	RootContent,
	Paragraph,
	Heading,
	Text,
	Emphasis,
	Strong,
	InlineCode,
	BlockContent,
	Link,
	Image,
	List,
	ListItem,
	Table,
	TableRow,
	TableCell,
	PhrasingContent,
	LinkReference,
	ImageReference,
	AlignType,
} from "mdast";

export type BaseNode = {
	text: string;
	alignment?: "left" | "center" | "right" | "justify";
	background?: string;
	bold?: boolean;
	characterSpacing?: number;
	color?: string;
	decoration?: "lineThrough";
	decorationStyle?: "dashed" | "dotted" | "double" | "wavy";
	decorationColor?: string;
	font?: string;
	fontSize?: number;
	italics?: boolean;
	lineHeight?: number;
	link?: string;
};

export type PagetHeading = {
	_type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	text: string | BaseNode[];
};

export type PagetParagraph = {
	_type?: "p";
	text: string | BaseNode[];
};

export type Blockquote = {
	_type: "blockquote";
	text: string | BaseNode[];
};

export type PagetCode = {
	_type: "code";
	text: string | BaseNode[];
	lang?: string;
};

export type PagetList =
	| { ul: Array<string | BaseNode[]> }
	| { ol: Array<string | BaseNode[]> };

export type PagetImage = {
	image: string; // path or URL in authored Paget (compiler will resolve to dd.images key)
	width?: number;
	height?: number;
	fit?: [number, number];
	alignment?: "left" | "center" | "right";
	margin?: [number, number, number, number];
};

/*
export type PagetHr = {
	table: { widths: ['*'], body: [['']] }, layout: { hLineWidth: (i) => i === 0 ? 1 : 0, vLineWidth: () => 0 };
};
*/

export type PagetTable = {
	table: {
		headerRows?: number;
		body: any[][];
		widths?: (number | "*" | "auto")[];
	};
	layout?: any;
};

export type PagetColumns = { columns: any[]; columnGap?: number };
export type PagetStack = { stack: any[] };

export type PagetNode =
	| PagetTextBlock
	| PagetList
	| PagetImage
	| PagetHr
	| PagetTable
	| PagetColumns
	| PagetStack
	| string;

export class Converter {
	private from: Root;
	private to: string; // later use a right type

	constructor(from: Root) {
		this.from = from;
	}

	public convert(): string {
		return this.from.toString();
	}
}

export function convertMdastToPaget(root: Root): PagetNode[] {
	const out: PagetNode[] = [];
	for (const child of root.children) {
		const node = emitBlock(child);
		if (Array.isArray(node)) out.push(...node);
		else if (node) out.push(node);
	}
	return out;
}

function emitBlock(node: RootContent): PagetNode | PagetNode[] | null {
	switch (node.type) {
		case "heading": {
			const h = node as Heading;
			const depth = clampHeadingDepth(h.depth);
			const rich = emitInline(h.children);
			return { _type: `h${depth}`, text: rich };
		}

		case "paragraph": {
			const p = node as Paragraph;
			const rich = emitInline(p.children);
			return { text: rich };
		}

		case "blockquote": {
			const parts: BaseNode[] = [];
			for (const b of node.children as BlockContent[]) {
				if (b.type === "paragraph") {
					parts.push(...emitInline(b.children), { text: "\n" });
				} else if (b.type === "heading") {
					parts.push(
						...((emitBlock(b) as PagetTextBlock)
							.text as BaseNode[]),
						{ text: "\n" },
					);
				}
			}
			if (parts.length && parts[parts.length - 1].text === "\n")
				parts.pop();
			return { _type: "blockquote", text: parts };
		}

		case "code": {
			return {
				_type: "code",
				text: node.value ?? "",
				preserveLeadingSpaces: true,
				lang: node.lang ?? null,
			};
		}

		case "list": {
			return convertList(node as List);
		}

		case "thematicBreak": {
			return horizontalRuleNode();
		}

		case "image": {
			const img = node as Image;
			return img.alt
				? [{ image: img.url }, { _type: "caption", text: img.alt }]
				: { image: img.url };
		}

		case "table": {
			return convertTable(node as Table);
		}

		// top-level inlines/definitions/frontmatter can be ignored or handled upstream
		case "definition":
		case "footnoteDefinition":
		case "yaml":
		case "html":
		case "text":
		case "break":
		case "emphasis":
		case "strong":
		case "delete":
		case "inlineCode":
		case "link":
		case "linkReference":
		case "imageReference":
			return null;

		default:
			return assertNever(node as never);
	}
}

function emitInline(children: PhrasingContent[]): BaseNode[] {
	const out: BaseNode[] = [];
	for (const n of children) {
		switch (n.type) {
			case "text":
				out.push({ text: (n as Text).value });
				break;

			case "strong": {
				const s = n as Strong;
				const inner = emitInline(s.children);
				inner.forEach((f) => (f.bold = true));
				out.push(...inner);
				break;
			}

			case "emphasis": {
				const e = n as Emphasis;
				const inner = emitInline(e.children);
				inner.forEach((f) => (f.italics = true));
				out.push(...inner);
				break;
			}

			case "delete": {
				const inner = emitInline(n.children);
				inner.forEach((f) => (f.decoration = "lineThrough"));
				out.push(...inner);
				break;
			}

			case "inlineCode": {
				const c = n as InlineCode;
				out.push({ text: c.value, background: "#f6f8fa", fontSize: 9 });
				break;
			}

			case "break": {
				out.push({ text: "\n" });
				break;
			}

			case "link": {
				const l = n as Link;
				const inner = emitInline(l.children);
				inner.forEach((f) => {
					f.link = l.url;
					f.decoration = "underline";
				});
				out.push(...inner);
				break;
			}

			case "image": {
				const i = n as Image;
				// pdfmake can’t place images inside a text array; emit alt fallback
				out.push({ text: i.alt ?? "[image]", italics: true });
				break;
			}

			case "linkReference": {
				const r = n as LinkReference;
				// Without a definition map we can’t resolve; emit label text
				const inner = emitInline(r.children);
				out.push(...inner);
				break;
			}

			case "imageReference": {
				const r = n as ImageReference;
				out.push({ text: r.alt ?? "[image]", italics: true });
				break;
			}

			case "html": {
				// Skip or sanitize to text; here we drop
				break;
			}

			default:
				return assertNever(n as never, "Unhandled inline node");
		}
	}
	return out;
}

function convertList(list: List): PagetList {
	const items: Array<string | BaseNode[] | PagetTextBlock> = [];

	for (const li of list.children as ListItem[]) {
		// Common case: first paragraph becomes the item label
		const firstPara = li.children.find((c) => c.type === "paragraph") as
			| Paragraph
			| undefined;
		const label: BaseNode[] = firstPara
			? emitInline(firstPara.children)
			: li.children.length
				? emitFallbackInline(li)
				: [{ text: "" }];

		if (typeof li.checked === "boolean") {
			const mark = li.checked ? "☑ " : "☐ ";
			items.push([{ text: mark }, ...label]);
		} else {
			items.push(label);
		}
	}

	return list.ordered ? { ol: items } : { ul: items };
}

function emitFallbackInline(li: ListItem): BaseNode[] {
	// Minimal fallback: concat any phrasing children of the first block
	const first = li.children[0];
	if (first && "children" in first) {
		const phrasing = first.children as PhrasingContent[] | undefined;
		return phrasing ? emitInline(phrasing) : [{ text: "" }];
	}
	return [{ text: "" }];
}

/* ---------------------------------- Tables --------------------------------- */

function convertTable(table: Table): PagetTable {
	const body: any[][] = [];

	let rowIndex = 0;
	for (const row of table.children as TableRow[]) {
		const cells: any[] = [];
		let colIndex = 0;
		for (const cell of row.children as TableCell[]) {
			const rich = emitInline(cell.children);
			const alignment = pickAlignment(table.align, colIndex);
			const cellObj = alignment
				? { text: rich, alignment }
				: { text: rich };
			cells.push(cellObj);
			colIndex++;
		}
		body.push(cells);
		rowIndex++;
	}

	return {
		table: { headerRows: 1, body },
		layout: "lightHorizontalLines",
	};
}

function pickAlignment(
	align: AlignType[] | null | undefined,
	col: number,
): "left" | "center" | "right" | undefined {
	if (!align) return undefined;
	const a = align[col] ?? null;
	return a === "left" || a === "center" || a === "right" ? a : undefined;
}

/* --------------------------------- Thematic HR ------------------------------ */

function horizontalRuleNode(): PagetHr {
	return {
		table: { widths: ["*"], body: [[""]] },
		layout: {
			hLineWidth: (i: number) => (i === 0 ? 1 : 0),
			hLineColor: () => "#dddddd",
			vLineWidth: () => 0,
			paddingTop: () => 6,
			paddingBottom: () => 6,
			paddingLeft: () => 0,
			paddingRight: () => 0,
		},
		margin: [0, 8, 0, 8],
	};
}

function assertNever(x: never, msg = "Unhandled node"): never {
	throw new Error(`${msg}: ${JSON.stringify(x)}`);
}

function clampHeadingDepth(d: Heading["depth"]): 1 | 2 | 3 | 4 | 5 | 6 {
	return Math.min(Math.max(d, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
}
