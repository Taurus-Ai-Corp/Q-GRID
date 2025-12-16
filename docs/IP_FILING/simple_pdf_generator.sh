#!/bin/bash
# Simple PDF Generator for Patent Applications
# Uses macOS built-in tools

echo "================================================"
echo "Patent Application PDF Generator"
echo "Taurus AI Corp - December 5, 2025"
echo "================================================"
echo ""

cd "$(dirname "$0")"

# Function to create clean HTML from markdown
create_html() {
    local md_file="$1"
    local html_file="$2"

    cat > "$html_file" << 'HTML_TEMPLATE'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Patent Application</title>
    <style>
        @page {
            size: letter;
            margin: 1in;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin: 24pt 0 16pt 0;
            page-break-after: avoid;
        }
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 20pt 0 12pt 0;
            border-bottom: 2px solid #333;
            page-break-after: avoid;
        }
        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin: 16pt 0 10pt 0;
        }
        p {
            margin: 8pt 0;
            text-align: justify;
        }
        pre, code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
            background-color: #f5f5f5;
            padding: 10px;
            border: 1px solid #ddd;
            page-break-inside: avoid;
            white-space: pre-wrap;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 12pt 0;
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
        .pagebreak {
            page-break-after: always;
        }
    </style>
</head>
<body>
HTML_TEMPLATE

    # Convert markdown to HTML (basic conversion)
    sed -e 's/^# \(.*\)$/<h1>\1<\/h1>/' \
        -e 's/^## \(.*\)$/<h2>\1<\/h2>/' \
        -e 's/^### \(.*\)$/<h3>\1<\/h3>/' \
        -e 's/^---$/<hr\/>/' \
        -e 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' \
        -e 's/`\([^`]*\)`/<code>\1<\/code>/g' \
        "$md_file" >> "$html_file"

    cat >> "$html_file" << 'HTML_FOOTER'
</body>
</html>
HTML_FOOTER
}

# Convert each patent
for md_file in PATENT_1_ZK_KYC_SPECIFICATION.md \
               PATENT_2_FRAUD_DETECTION_SPECIFICATION.md \
               PATENT_3_OFFLINE_CBDC_SPECIFICATION.md; do

    if [ -f "$md_file" ]; then
        base_name="${md_file%.md}"
        html_file="${base_name}.html"
        pdf_file="${base_name}.pdf"

        echo "Processing: $md_file"

        # Create HTML
        create_html "$md_file" "$html_file"
        echo "  ✓ Created HTML: $html_file"

        # Instructions for PDF creation
        echo "  → To create PDF:"
        echo "     1. Open $html_file in browser"
        echo "     2. Print to PDF (Cmd+P → Save as PDF)"
        echo "     3. Save as: $pdf_file"
        echo ""
    else
        echo "⚠  File not found: $md_file"
    fi
done

echo ""
echo "================================================"
echo "Next Steps for USPTO/IPO Filing:"
echo "================================================"
echo ""
echo "1. Open each HTML file in browser and print to PDF:"
for html in PATENT_*_SPECIFICATION.html; do
    [ -f "$html" ] && echo "   open \"$html\""
done
echo ""
echo "2. India IPO Filing:"
echo "   URL: https://ipindiaonline.gov.in/epatentfiling/"
echo "   Fee: ₹1,600 per patent (Startup)"
echo ""
echo "3. USPTO Filing:"
echo "   URL: https://www.uspto.gov/patents/apply/filing-online"
echo "   Fee: \$65 (micro) or \$130 (small entity) per patent"
echo ""
echo "================================================"
