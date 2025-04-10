#!/usr/bin/env python3
import os
import shutil
from datetime import datetime

# Configure these paths
SOURCE_DIR = os.path.join(os.path.dirname(__file__), "..", "browser", "outputs")
  # Your Robot Framework output directory
GITHUB_PAGES_DIR = "../jespesa.github.io/hyte-backend-exercises"  # Path to your GitHub Pages repo

# Create the destination directory if it doesn't exist
os.makedirs(GITHUB_PAGES_DIR, exist_ok=True)

# Get current date for the report directory
today = datetime.now().strftime("%Y-%m-%d")
report_dir = f"{GITHUB_PAGES_DIR}/{today}"
os.makedirs(report_dir, exist_ok=True)

# Copy all HTML files from the outputs directory to the GitHub Pages directory
print(f"Copying report files to {report_dir}...")
for file in os.listdir(SOURCE_DIR):
    if file.endswith(".html"):
        source_file = os.path.join(SOURCE_DIR, file)
        dest_file = os.path.join(report_dir, file)
        shutil.copy2(source_file, dest_file)
        print(f"Copied: {file}")

# Create or update the index.html file in the GitHub Pages repository
index_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TerveysPlus Test Reports</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1, h2 {{
            color: #3498db;
        }}
        .report-section {{
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        table, th, td {{
            border: 1px solid #ddd;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #3498db;
            color: white;
        }}
        tr:nth-child(even) {{
            background-color: #f2f2f2;
        }}
        a {{
            color: #3498db;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <h1>TerveysPlus Test Reports</h1>
    
    <div class="report-section">
        <h2>Latest Test Reports ({today})</h2>
        <table>
            <tr>
                <th>Test</th>
                <th>Report</th>
                <th>Log</th>
            </tr>
"""

# Add entries for each test
reports = {}
logs = {}

for file in os.listdir(report_dir):
    if file.endswith("-report.html"):
        test_name = file.replace("-report.html", "")
        reports[test_name] = file
    elif file.endswith("-log.html"):
        test_name = file.replace("-log.html", "")
        logs[test_name] = file

for test_name in sorted(set(list(reports.keys()) + list(logs.keys()))):
    report_link = f"<a href='{today}/{reports.get(test_name, '')}'>Report</a>" if test_name in reports else "N/A"
    log_link = f"<a href='{today}/{logs.get(test_name, '')}'>Log</a>" if test_name in logs else "N/A"
    
    index_content += f"""
            <tr>
                <td>{test_name}</td>
                <td>{report_link}</td>
                <td>{log_link}</td>
            </tr>"""

index_content += """
        </table>
    </div>

    <div class="report-section">
        <h2>About the Tests</h2>
        <p>These are automated tests for the TerveysPlus health tracking application. The tests are written using Robot Framework and cover various aspects of the application's functionality.</p>
        <p><a href="https://github.com/jespesa/hyte-backend-exercises">View the project on GitHub</a></p>
    </div>
</body>
</html>
"""

with open(os.path.join(GITHUB_PAGES_DIR, "index.html"), "w") as f:
    f.write(index_content)
print(f"Created index.html in {GITHUB_PAGES_DIR}")

print("Done! Now commit and push the changes to your GitHub Pages repository.")