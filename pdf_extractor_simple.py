#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Simple PDF extractor - Extracts text and images only
"""

import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF is not installed.")
    print("Install it with: pip install pymupdf")
    sys.exit(1)


def split_by_main_sections(text):
    """Splits text into main sections (1., 2., 3., 4., 5.)."""
    import re
    
    sections = {}
    current_section = "00-introduction"
    current_content = []
    
    # Sections principales connues
    main_sections = {
        "1. Paramètres du match et sécurité": "01-parametres",
        "2. Le jeu": "02-le-jeu",
        "3. Score": "03-score",
        "4. Pénalités": "04-penalites",
        "5. Arbitrage": "05-arbitrage"
    }
    
    for line in text.split('\n'):
        stripped = line.strip()
        
        # Check if it's a main section
        found_section = False
        for section_title, section_key in main_sections.items():
            if stripped == section_title:
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                # Start a new section
                current_section = section_key
                current_content = [f"# {stripped}\n"]
                found_section = True
                break
        
        if not found_section:
            current_content.append(line)
    
    # Save last section
    if current_content:
        sections[current_section] = '\n'.join(current_content)
    
    return sections


def extract_pdf(pdf_path, output_dir):
    """Extracts text and images."""
    
    print(f"📖 Opening {pdf_path.name}...")
    doc = fitz.open(pdf_path)
    
    # Create directories
    output_dir.mkdir(parents=True, exist_ok=True)
    images_dir = output_dir / "images"
    images_dir.mkdir(exist_ok=True)
    sections_dir = output_dir / "sections"
    sections_dir.mkdir(exist_ok=True)
    
    full_text = []
    image_count = 0
    
    print(f"📄 Extracting {len(doc)} pages...")
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Extract text
        text = page.get_text()
        
        # Basic cleaning
        cleaned_lines = []
        for line in text.split('\n'):
            stripped = line.strip()
            # Ignore footers
            if stripped.startswith('©') and 'WFTDA' in stripped:
                continue
            if 'Les règles du Roller Derby sur piste plate' in stripped:
                continue
            if stripped.isdigit() and len(stripped) <= 3:
                continue
            cleaned_lines.append(line)
        
        full_text.append('\n'.join(cleaned_lines))
        
        # Extract images
        for img in page.get_images():
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_count += 1
                image_filename = f"image_{image_count:03d}.{base_image['ext']}"
                image_path = images_dir / image_filename
                image_path.write_bytes(base_image["image"])
            except:
                pass
    
    doc.close()
    
    # Join all text
    raw_text = '\n\n'.join(full_text)
    
    # Merge lines broken by layout
    print("🔧 Cleaning line breaks...")
    lines = raw_text.split('\n')
    cleaned = []
    buffer = ""
    
    for line in lines:
        stripped = line.strip()
        
        # Empty line = new paragraph
        if not stripped:
            if buffer:
                cleaned.append(buffer)
                buffer = ""
            cleaned.append("")
            continue
        
        # If line ends with hyphen, merge with next
        if buffer.endswith('-'):
            buffer = buffer[:-1] + stripped
        # If previous line doesn't end with punctuation, merge
        elif buffer and not buffer[-1] in '.!?:;,)»':
            buffer += " " + stripped
        else:
            if buffer:
                cleaned.append(buffer)
            buffer = stripped
    
    # Add last buffer
    if buffer:
        cleaned.append(buffer)
    
    complete_text = '\n'.join(cleaned)
    
    # Save complete file
    output_file = output_dir / "contenu-complet.md"
    output_file.write_text(complete_text, encoding='utf-8')
    
    # Split into sections
    print("📁 Splitting into sections...")
    sections = split_by_main_sections(complete_text)
    
    for section_key, section_content in sections.items():
        section_file = sections_dir / f"{section_key}.md"
        section_file.write_text(section_content, encoding='utf-8')
        print(f"   ✓ {section_file.name}")
    
    print(f"\n✅ Done!")
    print(f"   📝 Complete content: {output_file}")
    print(f"   📂 Sections: {len(sections)} files in {sections_dir}")
    print(f"   🖼️  Images: {image_count} files in {images_dir}")
    
    return output_file


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_extractor_simple.py <file.pdf> <output_directory>")
        sys.exit(1)
    
    pdf_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    
    if not pdf_path.exists():
        print(f"Error: {pdf_path} not found")
        sys.exit(1)
    
    extract_pdf(pdf_path, output_dir)
