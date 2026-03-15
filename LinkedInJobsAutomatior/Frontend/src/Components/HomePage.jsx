import { useState, useMemo } from "react";

export default function JobFinderUI() {

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("Remote");
  const [timeframe, setTimeframe] = useState("week");
  const [experience, setExperience] = useState("2");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showApplied, setShowApplied] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showRemote, setShowRemote] = useState(false);

const saveReport = async () => {

  try {

    const res = await fetch("https://linkedinautomation-app-backend.onrender.com/save-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobs: jobs
      })
    });

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "jobs_report.xlsx";

    document.body.appendChild(a);
    a.click();

    a.remove();

  } catch (err) {
    console.error(err);
  }

};


  const searchJobs = async () => {

    setLoading(true);

    try {

      const res = await fetch("https://linkedinautomation-app-backend.onrender.com/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role,
          location,
          timeframe,
          experience
        })
      });

      const data = await res.json();

      setJobs(data.jobs || []);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };


  const applyJob = (url) => {
    window.open(url, "_blank");
  };


  const markApplied = async (jobId, index) => {

    await fetch(`https://linkedinautomation-app-backend.onrender.com/apply/${jobId}`, {
      method: "POST"
    });

    const updatedJobs = [...jobs];

    updatedJobs[index].applied = true;
    updatedJobs[index].applied_date =
      new Date().toISOString().split("T")[0];

    setJobs(updatedJobs);
  };


  /* ---------- Dashboard Stats ---------- */

  const totalJobs = jobs.length;

  const appliedJobs = jobs.filter(j => j.applied).length;

  const pendingJobs = totalJobs - appliedJobs;


  /* ---------- Filters ---------- */

  const filteredJobs = useMemo(() => {

    let filtered = [...jobs];

    if (showApplied)
      filtered = filtered.filter(j => j.applied);

    if (showPending)
      filtered = filtered.filter(j => !j.applied);

    if (showRemote)
      filtered = filtered.filter(j =>
        j.location?.toLowerCase().includes("remote")
      );

    return filtered;

  }, [jobs, showApplied, showPending, showRemote]);


  return (

    <div className="container">

      <h1 className="title">AI Job Finder</h1>


      {/* ---------- DASHBOARD ---------- */}

      <div className="dashboard">

        <div className="statCard">
          <h3>Total Jobs</h3>
          <p>{totalJobs}</p>
        </div>

        <div className="statCard">
          <h3>Applied</h3>
          <p>{appliedJobs}</p>
        </div>

        <div className="statCard">
          <h3>Pending</h3>
          <p>{pendingJobs}</p>
        </div>

      </div>


      {/* ---------- SEARCH ---------- */}

      <div className="searchBox">

        <input
          className="input"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <input
          className="input"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="input"
          placeholder="Experience (0-3 yrs)"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />

        <select
          className="select"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>

        

        <button className="searchBtn" onClick={searchJobs}>
          {loading ? "Searching..." : "Find Jobs"}
        </button>

      </div>


      {/* ---------- FILTERS ---------- */}

      <div className="filters">

        <label>
          <input
            type="checkbox"
            checked={showApplied}
            onChange={() => setShowApplied(!showApplied)}
          />
          Show Applied
        </label>

        <label>
          <input
            type="checkbox"
            checked={showPending}
            onChange={() => setShowPending(!showPending)}
          />
          Show Pending
        </label>

        <label>
          <input
            type="checkbox"
            checked={showRemote}
            onChange={() => setShowRemote(!showRemote)}
          />
          Remote Only
        </label>

      </div>
      <div style={{marginBottom:"20px"}}>

  <button
    className="searchBtn"
    onClick={saveReport}
  >
    Save Report
  </button>

</div>


      {/* ---------- JOB LIST ---------- */}

      <div className="jobsContainer">

        {filteredJobs.map((job, index) => (

          <div key={index} className="jobCard">

            <div>

              <h2 className="jobTitle">{job.title}</h2>

              <p className="company">{job.company}</p>

              <p className="location">{job.location}</p>

              {job.applied && (
                <p className="appliedDate">
                  Applied on {job.applied_date}
                </p>
              )}

            </div>


            <div className="actions">

              <button
                className="applyBtn"
                onClick={() => applyJob(job.link)}
              >
                Apply Now
              </button>

              <label>

                <input
                  type="checkbox"
                  checked={job.applied || false}
                  onChange={() => markApplied(job.id, index)}
                />

                Applied

              </label>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}