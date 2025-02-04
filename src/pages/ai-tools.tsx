import { useState } from "react";

export default function AITools() {
  const [type, setType] = useState<"enhance_cv" | "cover_letter">("enhance_cv");
  const [cv, setCV] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, cv, jobDescription }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (error) {
        console.error(error)
      setError("Failed to connect to the server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">AI-Powered Tools</h1>

        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={() => setType("enhance_cv")}
            className={`px-4 py-2 rounded-md ${type === "enhance_cv" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Enhance CV
          </button>
          <button
            onClick={() => setType("cover_letter")}
            className={`px-4 py-2 rounded-md ${type === "cover_letter" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Generate Cover Letter
          </button>
        </div>

        <textarea
          placeholder="Paste your CV here..."
          value={cv}
          onChange={(e) => setCV(e.target.value)}
          className="w-full border p-3 rounded-md mb-4 h-32"
        />

        {type === "cover_letter" && (
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full border p-3 rounded-md mb-4 h-32"
          />
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {result && (
          <div className="mt-4 bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
