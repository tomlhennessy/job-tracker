import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { Job } from "../../types/job";
import Layout from "../../components/Layout";

export default function AIToolsForJob() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<Job | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [followUpDate, setFollowUpDate] = useState<string | null>(null);
  const [status, setStatus] = useState("applied");

  const fetchJob = useCallback(async () => {
    const res = await fetch(`/api/jobs?id=${id}`);
    const data = await res.json();
    setJob(data);
    setJobDescription(data.jobDescription || "");
    setCoverLetter(data.coverLetter || "");
    setFollowUpDate(data.followUpDate || "");
    setStatus(data.status || "applied");
  }, [id]);

  useEffect(() => {
    if (id) fetchJob();
  }, [id, fetchJob]);

  const handleSave = async () => {
    const res = await fetch("/api/jobs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: job?.id,
        jobDescription,
        coverLetter,
        followUpDate,
        status,
      }),
    });

    if (res.ok) {
      alert("✅ Job details saved successfully!");
      fetchJob();
    } else {
      alert("❌ Failed to save job details.");
    }
  };

  const handleGenerateCoverLetter = async () => {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cover_letter",
        cv: "Insert your CV here", // Placeholder for actual CV data
        jobDescription,
      }),
    });

    const data = await res.json();
    setCoverLetter(data.result);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white shadow-soft rounded-2xl p-8 mt-8 space-y-6">
        {/* 🔙 Back to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-slate-400 hover:bg-gray-600 text-white px-4 py-2 rounded-md mb-6 shadow-md hover:shadow-lg transition duration-300"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold gradient-text text-center opacity-90">
          {job?.company} - {job?.position}
        </h1>

        {/* Job Status */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700">Job Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="offer">Offer</option>
          </select>
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700">Job Description:</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Add the job description here..."
            className="w-full h-32 p-4 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            rows={6}
          />
        </div>

        {/* Cover Letter */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700">Cover Letter:</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Generated cover letter will appear here..."
            className="w-full h-32 p-4 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            rows={8}
          />
        </div>

        {/* Follow-up Date */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700">Follow-up Date:</label>
          <input
            type="date"
            value={followUpDate || ""}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="border rounded-md p-2 w-full focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleGenerateCoverLetter}
            className="w-full bg-gradient text-white py-3 rounded-xl shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100"
          >
            ✨ Generate Cover Letter
          </button>

          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition opacity-90 hover:opacity-100"
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </Layout>
  );
}
