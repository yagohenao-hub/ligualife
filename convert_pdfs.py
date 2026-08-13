import os
from pypdf import PdfReader

def convert_pdfs():
    pdf_dir = '.'
    md_dir = '_docs_md'
    os.makedirs(md_dir, exist_ok=True)
    
    for filename in os.listdir(pdf_dir):
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(pdf_dir, filename)
            md_path = os.path.join(md_dir, filename.replace('.pdf', '.md'))
            
            print(f"Reading {filename}...")
            try:
                reader = PdfReader(pdf_path)
                text = f"# {filename}\n\n"
                for i, page in enumerate(reader.pages):
                    text += f"## Page {i+1}\n\n"
                    text += page.extract_text() + "\n\n"
                    
                with open(md_path, 'w', encoding='utf-8') as f:
                    f.write(text)
                print(f"Saved {md_path}")
            except Exception as e:
                print(f"Error on {filename}: {e}")

if __name__ == '__main__':
    convert_pdfs()
