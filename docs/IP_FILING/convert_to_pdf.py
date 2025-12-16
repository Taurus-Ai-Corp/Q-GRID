#!/usr/bin/env python3
"""
Convert Patent Specification Markdown files to PDF
Using WeasyPrint for USPTO/IPO submission
"""

from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import os

# CSS styling for patent documents
patent_css = CSS(string='''
    @page {
        size: letter;
        margin: 1in;
        @top-center {
            content: "Patent Application - Taurus AI Corp";
            font-size: 9pt;
            font-family: Arial, sans-serif;
        }
        @bottom-center {
            content: "Page " counter(page);
            font-size: 9pt;
            font-family: Arial, sans-serif;
        }
    }

    body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
    }

    h1 {
        font-size: 18pt;
        font-weight: bold;
        margin-top: 24pt;
        margin-bottom: 16pt;
        text-align: center;
        page-break-after: avoid;
    }

    h2 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 20pt;
        margin-bottom: 12pt;
        border-bottom: 2px solid #333;
        page-break-after: avoid;
    }

    h3 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 16pt;
        margin-bottom: 10pt;
    }

    p {
        margin-top: 8pt;
        margin-bottom: 8pt;
        text-align: justify;
    }

    code {
        font-family: 'Courier New', Courier, monospace;
        font-size: 10pt;
        background-color: #f5f5f5;
        padding: 2px 4px;
        border: 1px solid #ddd;
    }

    pre {
        font-family: 'Courier New', Courier, monospace;
        font-size: 9pt;
        background-color: #f8f8f8;
        padding: 12px;
        border: 1px solid #ccc;
        overflow-x: auto;
        page-break-inside: avoid;
        line-height: 1.4;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        margin: 12pt 0;
        font-size: 11pt;
    }

    th, td {
        border: 1px solid #000;
        padding: 8pt;
        text-align: left;
    }

    th {
        background-color: #e8e8e8;
        font-weight: bold;
    }

    hr {
        border: none;
        border-top: 1px solid #333;
        margin: 16pt 0;
    }

    strong {
        font-weight: bold;
    }

    em {
        font-style: italic;
    }

    ul, ol {
        margin-left: 24pt;
        margin-top: 8pt;
        margin-bottom: 8pt;
    }

    li {
        margin-bottom: 4pt;
    }
''')

def convert_md_to_html(md_content):
    """Convert markdown to simple HTML"""
    html = md_content

    # Convert headers
    html = html.replace('# ', '<h1>').replace('\n## ', '</h1>\n<h2>')
    html = html.replace('\n### ', '\n<h3>').replace('\n#### ', '\n<h4>')

    # Convert bold and italic
    import re
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

    # Convert code blocks
    html = re.sub(r'```(\w+)?\n(.*?)```', r'<pre><code>\2</code></pre>', html, flags=re.DOTALL)
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)

    # Convert lists
    lines = html.split('\n')
    in_list = False
    result = []

    for line in lines:
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            if not in_list:
                result.append('<ul>')
                in_list = True
            result.append(f'<li>{line.strip()[2:]}</li>')
        elif line.strip().startswith(('1. ', '2. ', '3. ', '4. ', '5. ')):
            if not in_list:
                result.append('<ol>')
                in_list = True
            result.append(f'<li>{line.strip()[3:]}</li>')
        else:
            if in_list:
                result.append('</ul>' if '<ul>' in result else '</ol>')
                in_list = False
            result.append(line)

    html = '\n'.join(result)

    # Convert horizontal rules
    html = html.replace('---', '<hr>')

    # Wrap paragraphs
    paragraphs = html.split('\n\n')
    html = '\n\n'.join([f'<p>{p}</p>' if not p.startswith('<') and p.strip() else p for p in paragraphs])

    # Wrap in HTML structure
    html_doc = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Patent Application</title>
    </head>
    <body>
        {html}
    </body>
    </html>
    '''

    return html_doc

def convert_patent_to_pdf(md_file, pdf_file):
    """Convert markdown patent file to PDF"""
    print(f"Converting {md_file} to {pdf_file}...")

    try:
        # Read markdown file
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()

        # Convert to HTML
        html_content = convert_md_to_html(md_content)

        # Create PDF
        font_config = FontConfiguration()
        HTML(string=html_content).write_pdf(
            pdf_file,
            stylesheets=[patent_css],
            font_config=font_config
        )

        print(f"✅ Created: {pdf_file}")
        return True

    except Exception as e:
        print(f"❌ Error converting {md_file}: {str(e)}")
        return False

if __name__ == "__main__":
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Patent files to convert
    patents = [
        ("PATENT_1_ZK_KYC_SPECIFICATION.md", "PATENT_1_ZK_KYC_SPECIFICATION.pdf"),
        ("PATENT_2_FRAUD_DETECTION_SPECIFICATION.md", "PATENT_2_FRAUD_DETECTION_SPECIFICATION.pdf"),
        ("PATENT_3_OFFLINE_CBDC_SPECIFICATION.md", "PATENT_3_OFFLINE_CBDC_SPECIFICATION.pdf"),
    ]

    success_count = 0
    for md_file, pdf_file in patents:
        md_path = os.path.join(current_dir, md_file)
        pdf_path = os.path.join(current_dir, pdf_file)

        if os.path.exists(md_path):
            if convert_patent_to_pdf(md_path, pdf_path):
                success_count += 1
        else:
            print(f"⚠️  File not found: {md_file}")

    print(f"\n📊 Conversion Summary: {success_count}/{len(patents)} patents converted successfully")

    if success_count == len(patents):
        print("\n✅ All patent PDFs ready for USPTO/IPO filing!")
        print("\nNext steps:")
        print("1. Review PDFs for formatting")
        print("2. File India IPO: https://ipindiaonline.gov.in/epatentfiling/")
        print("3. File USPTO: https://www.uspto.gov/patents/apply/filing-online")
