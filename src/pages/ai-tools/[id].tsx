import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AIToolsForJob() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const fetchJob = async () => {
    const res = await fetch(`/api/jobs?id=${id}`);
    const data = await res.json();
    setJob(data);
    setCoverLetter(data.coverLetter || "");
    setLoading(false);
  };

  const handleGenerateCoverLetter = async () => {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cover_letter",
        cv: "Insert your CV here",
        jobDescription: job.jobDescription,
      }),
    });

    const data = await res.json();
    setCoverLetter(data.result);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
      <h1 className="text-2xl font-bold">{job.company} - {job.position}</h1>
      <p className="mt-2"><strong>Status:</strong> {job.status}</p>
      <p className="mt-4">{job.jobDescription}</p>

      <button
        onClick={handleGenerateCoverLetter}
        className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
      >
        Generate Cover Letter
      </button>

      {coverLetter && (
        <div className="mt-4 bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
          {coverLetter}
        </div>
      )}
    </div>
  );
}
