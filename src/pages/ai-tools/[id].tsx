import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

interface Job {
    id: string;
    userId: string;
    company: string;
    position: string;
    status: string;
    createdAt: string;
    coverLetter?: string;
    jobDescription?: string;
    followUpDate?: string;
}

export default function JobDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [job, setJob] = useState<Job | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/jobs/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setJob(data);
                setJobDescription(data.jobDescription || "");
                setCoverLetter(data.coverLetter || "No cover letter yet.");
            })
            .catch((error) => console.error("Error fetching job:", error));
    }, [id]);

    const handleSaveDescription = async () => {
        await fetch(`/api/jobs/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobDescription }),
        });
        alert("Job description saved!");
    };

    const handleGenerateCoverLetter = async () => {
        setLoading(true);
        const response = await fetch(`/api/ai/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId: id, cv: "Your CV Here", jobDescription }),
        });

        const data = await response.json();
        setCoverLetter(data.result);
        setLoading(false);
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto bg-white shadow-md p-6 rounded-lg">
                {job ? (
                    <>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {job.company} - {job.position}
                        </h1>

                        {/* Job Description */}
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-800">Job Description</h2>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full p-3 border rounded-lg mt-2"
                                placeholder="Enter job description here..."
                            />
                            <button
                                onClick={handleSaveDescription}
                                className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                            >
                                Save Description
                            </button>
                        </div>

                        {/* Cover Letter */}
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-800">AI-Generated Cover Letter</h2>
                            <p className="mt-2 p-3 border rounded-lg bg-gray-50 text-gray-700">
                                {coverLetter}
                            </p>
                            <button
                                onClick={handleGenerateCoverLetter}
                                className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
                                disabled={loading}
                            >
                                {loading ? "Generating..." : "Generate with AI"}
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500">Loading job details...</p>
                )}
            </div>
        </Layout>
    );
}
