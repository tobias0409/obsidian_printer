# Printer

Printer is an Obsidian plugin that lets you turn your notes into clean, professional-looking PDFs — all with a single click, right from your vault.
No copy–paste, no external apps, no internet required after setup. Just write, print, and share.

## ✨ Features

- Adds “Print PDF” to your note menu
- Works on Desktop & Mobile — print from any device
- Works fully offline after initial setup
- Optional templates for custom layouts

## 🚀 How to use

- Install & enable the plugin
- Right-click any markdown note and select *Printer: Print PDF*
- (Optional) Pick a template → Submit
- Done! A PDF is created next to your note

## 🧩 Templates

Printer supports fully customizable Typst-based templates, giving you complete control over the layout, styling, and structure of the exported PDF

### Template structure

Create a folder inside:
`.obsidian/plugins/Printer/templates/<template-name>/`

The folder must contain:

- template.typ — defines the layout and formatting
- images/ (optional) — contains image assets referenced by the template
	- Only direct child images are supported

### Example

```
templates/
  Report/
    template.typ
    images/
      logo.png
```

Once the folder is created, the template will automatically appear in the Print PDF dialog and can be selected during export.

### Placeholders

During export, Printer uses Pandoc to convert Markdown into Typst. In this step, any metadata defined in the note’s YAML frontmatter is exposed as variables using Pandoc’s template syntax. These variables are substituted before Typst runs, allowing templates to dynamically insert or conditionally display content based on the note’s metadata.

```markdown
// Markdown note frontmatter
project: Alpha
```

```typst
// Pandoc template.typ (executed before Typst)
$if(project)$
#let project = "$project$"
$endif$

#page(
  header: project,
)

#body
```


## 🙏 Thanks to

This project wouldn’t be possible without these amazing tools and communities:

- pandoc
- pandoc-wasm
- typst
- typst TS
- obsidian and its plugin ecosystem
