from flask import Flask, request, jsonify
from flask_cors import CORS
from scrape_jobs import scrape_jobs
import os
import json
import pandas as pd
from flask import request, send_file
import io
app = Flask(__name__)
CORS(app)

@app.route("/jobs", methods=["GET", "POST"])
def get_jobs():

    if request.method == "POST":
        data = request.json
        role = data.get("role")
        location = data.get("location", "Remote")
        print("The data is",data)

        roles = [role] if role else None

    else:
        # default test values
        roles = ["Python Developer"]
        location = "Remote"

    jobs = scrape_jobs(keyword=role, location=location)

    return jsonify({"jobs": jobs})


@app.route("/save-report", methods=["POST"])
def save_report():

    data = request.json
    new_jobs = data.get("jobs", [])

    json_file = "jobs_report.json"
    excel_file = "jobs_report.xlsx"

    # ------------------------
    # Load existing JSON data
    # ------------------------
    if os.path.exists(json_file):
        with open(json_file, "r") as f:
            existing_jobs = json.load(f)
    else:
        existing_jobs = []

    # ------------------------
    # Append new jobs
    # ------------------------
    combined_jobs = existing_jobs + new_jobs

    # ------------------------
    # Save JSON
    # ------------------------
    with open(json_file, "w") as f:
        json.dump(combined_jobs, f, indent=4)

    df = pd.DataFrame(combined_jobs)

    # Create Excel in memory
    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Jobs")

    output.seek(0)

    return send_file(
        output,
        download_name="jobs_report.xlsx",
        as_attachment=True,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
if __name__ == "__main__":
    app.run(debug=True)