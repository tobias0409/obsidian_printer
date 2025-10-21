# Printer

A plugin for [Obsidian](https://obsidian.md/) that lets you export notes as clean, styled PDFs directly from your vault.

Generate polished documents without leaving Obsidian—no copy–paste or external tools required. Useful for reports, handouts, documentation, or sharing notes with others. Works fully offline after setup and keeps your formatting consistent.

> [!Warning]
> This plugin is currently under **active development** and may be **unstable** or **change unexpectedly**. Always backup your vault before using it.

## Demo

The demo below shows exporting a note with and without a custom template.

![Demo](images/demo.gif)

## Installation

This plugin isn’t yet in the official Obsidian Community Plugins directory. The easiest way to install it is via the BRAT plugin. Install BRAT from Community plugins, then add the `Printer` repository URL as a beta plugin. See the [BRAT](https://tfthacker.com/BRAT) documentation for details.

## Roadmap

Below is a brief overview of planned and completed features for future releases:

- [x] PDF print with embedded images
- [x] Custom templates
- [x] Custom fonts
- [ ] PDF preview
- [ ] Template marketplace accessible from plugin settings
- [ ] Replace Pandoc with a native CommonMark + LaTeX converter to reduce plugin size

## Templates

Printer supports fully customizable Typst-based templates, giving you complete control over the layout, styling, and structure of the exported PDF.

### Template structure

In the plugin settings, you can choose the folder where templates are stored. Inside this folder, each template must be placed in its own subfolder with the following structure:

```
Template Folder
├── my_template
│   ├── template.typ — defines the layout and formatting
│   └── images/ (optional) — contains image assets
│       └── Only direct child images are supported
```

Once the folder with a `template.typ` is created, the template will automatically appear in the `Print PDF` dialog and can be selected during export. You (the user) is responsible for ensuring that the template is valid Typst code and that all referenced assets exist.

#### Fonts

Printer supports custom fonts in templates. To use them, specify the folder where fonts are stored in the plugin settings. Then, place the `.ttf` or `.otf` font files directly inside that folder.

### Example of a template file

In the following section, we will provide an example of a template file. Since the template is a typst file, you can use all the features of typst to create a custom layout and styling. For more information on how to create a template, see the [Typst documentation](https://typst.app/docs/).

```typst
#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  numbering: "1",
  number-align: center,
)

// Text settings
#set text(
  font: "Segoe UI", // Custom fonts needs to be installed by adding them to the defined font folder
  size: 11pt,
)

#set par(justify: true)

// Title Page
#align(center)[
  #v(3cm)

  #text(24pt, weight: "bold")[
    $title$
  ]

  #v(1cm)

  #text(16pt)[
    $subtitle$
  ]

  #v(2cm)

  $if(authors)$
  $for(authors)$
  #text(12pt)[
    $it$
  ]
  $endfor$
  $endif$

  #v(1fr)

  #text(11pt)[
    #datetime.today().display()
  ]
]

#pagebreak()

// Table of Contents
#outline(
  title: "Table of Contents",
)

#pagebreak()

$body$
```

Important to note are the placeholders. Placeholders allows you to dynamically insert or conditionally display content based on the note’s metadata. Placeholders are defined in the note’s YAML frontmatter and are exposed as variables using Pandoc’s template syntax. For example, you define a metadata field `title: Some title` in the note’s YAML frontmatter. Then, in the template, you can access the `title` variable using the syntax `$title$`. Special is the $body$ placeholder, which represents the main content of the note. For more information, see the [Pandoc documentation](https://pandoc.org/MANUAL.html#variables).

## Feedback

If you have any feedback or suggestions for improving the plugin, please feel free to open an issue on the [GitHub repository](https://github.com/tobias0409/obsidian_printer).

## Support

If you find this plugin useful, please consider starring the repository. If you’d like to support its development financially, consider supporting one of the projects mentioned below.

## Acknowledgments

This project is made possible by the outstanding work of these tools and communities:

- [Pandoc](https://github.com/jgm/pandoc)
- [pandoc-wasm](https://github.com/tweag/pandoc-wasm)
- [Typst](https://github.com/typst)
- [typst.ts](https://github.com/Myriad-Dreamin/typst.ts)
- [Obsidian](https://github.com/obsidianmd) and its plugin ecosystem
