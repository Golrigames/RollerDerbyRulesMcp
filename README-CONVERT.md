# PDF to Markdown Sections

A Python script to convert a PDF into multiple structured Markdown files with image extraction.

## Description

This script uses **PyMuPDF** to:

1. Extract text and images from a PDF file
2. Convert text to Markdown format with automatic title detection
3. Split the Markdown into sections based on level 1 headings (`# Title`)
4. Save each section in a separate Markdown file

## Prerequisitesites

### Python

Python 3.6 or higher

### Python Dependencies

The script requires **PyMuPDF** to extract text and images from PDFs:

```bash
pip install pymupdf
```

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd mcpDerby
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
```

### 3. Activate the virtual environment

**Linux/macOS**:

```bash
source venv/bin/activate
```

**Windows**:

```bash
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

Or directly:

```bash
pip install pymupdf
```

## Usage

### Basic syntax

```bash
python pdf_extractor_simple.py <file.pdf> <output_directory>
```

### Simple example

```bash
python pdf_extractor_simple.py my_document.pdf output
```

This command will create:

- `output/sections/` : containing Markdown files (00-introduction.md, 01-parametres.md, etc.)
- `output/images/` : containing extracted images
- `output/contenu-complet.md` : the complete Markdown before splitting

## Output structure

After execution, you will get:

```
output/
├── contenu-complet.md    # Complete Markdown before splitting
├── images/               # Images extracted from PDF
│   ├── image_001.png
│   ├── image_002.png
│   └── ...
└── sections/             # Separate Markdown sections
    ├── 00-introduction.md
    ├── 01-parametres.md
    ├── 02-le-jeu.md
    ├── 03-score.md
    ├── 04-penalites.md
    └── 05-arbitrage.md
```

Links to images in Markdown files automatically point to the `images/` folder.

## Deactivating the virtual environment

When you're done:

```bash
deactivate
```

## Troubleshooting

### Error "PyMuPDF is not installed"

Make sure you have activated your virtual environment and installed dependencies:

```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install pymupdf
```

### Error "PDF file not found"

Check the path to your PDF file. You can use absolute or relative paths.

### Images are not displayed

Verify that the `images/` folder is at the same level as the `sections/` folder in your output structure.

## License

This project is provided as is, without warranty.
