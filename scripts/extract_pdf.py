import sys, subprocess
try:
    import pypdf
except Exception:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pypdf'])
    import pypdf
from pathlib import Path
pdf_path = Path('d:/ConfidraWeb/confidraweb/Confidra_Website_Content_Architecture.pdf')
out_path = Path('d:/ConfidraWeb/confidraweb/Confidra_PDF_Text.txt')
reader = pypdf.PdfReader(str(pdf_path))
text = []
for p in reader.pages:
    t = p.extract_text()
    if t:
        text.append(t)
out = "\n\n".join(text)
out_path.write_text(out, encoding='utf-8')
print('EXTRACTED', len(out))
