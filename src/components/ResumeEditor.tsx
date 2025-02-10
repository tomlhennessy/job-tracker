import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import ResumeTemplate from "./ResumeTemplate"; // ✅ Use ResumeTemplate instead of ResumePreview

interface ResumeData {
    id: string;
    userId: string;
    version: number;
    content: string;
    isAiGenerated: boolean;
    createdAt: string;
}

export default function ResumeEditor() {
    const [rawCV, setRawCV] = useState("");
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch all resume versions
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await fetch("/api/resume");
                const data = await response.json();
                setResumes(data);
                if (data.length > 0) setSelectedResume(data[0]); // Select latest resume by default
            } catch (err) {
                console.error("Failed to fetch resumes:", err);
            }
        };

        fetchResumes();
    }, []);

    const handleEnhance = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "ai_generate", rawCV }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to enhance resume.");

            setResumes([data.resume, ...resumes]); // Add new version to list
            setSelectedResume(data.resume);
        } catch (error) {
            if (error instanceof Error) setError(error.message);
            else setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: selectedResume?.content,
                    isAiGenerated: false,
                }),
            });

            alert("✅ Resume saved as a new version!");
        } catch (error) {
            console.error(error);
            alert("❌ Failed to save resume.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const element = document.getElementById("resume-preview");
        if (element) {
            html2pdf().from(element).save("Appli-sh_Resume.pdf");
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center gradient-text opacity-90 mb-4">
                📄 My Resume
            </h2>

            {/* Resume Version Selector */}
            <label className="block mb-2 text-gray-700">Select Resume Version:</label>
            <select
                className="border p-2 rounded-md w-full mb-4"
                value={selectedResume?.id || ""}
                onChange={(e) => {
                    const selected = resumes.find((r) => r.id === e.target.value);
                    if (selected) setSelectedResume(selected);
                }}
            >
                {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                        Version {resume.version} - {new Date(resume.createdAt).toLocaleDateString()} {resume.isAiGenerated ? "(AI)" : ""}
                    </option>
                ))}
            </select>

            {/* PREVIEW STATE (Using ResumeTemplate) */}
            {selectedResume && (
                <ResumeTemplate resume={JSON.parse(selectedResume.content)} /> // ✅ Swapped out ResumePreview for ResumeTemplate
            )}

            <div className="flex gap-4 mt-4 justify-center">
                <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg"
                >
                    💾 Save as New Version
                </button>
                <button
                    onClick={handleExportPDF}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg"
                >
                    📥 Export to PDF
                </button>
            </div>

            {/* AI ENHANCEMENT */}
            <div className="mt-6">
                <textarea
                    value={rawCV}
                    onChange={(e) => setRawCV(e.target.value)}
                    placeholder="Paste your raw CV here..."
                    className="w-full p-4 border rounded-md h-48"
                />
                <button
                    onClick={handleEnhance}
                    disabled={loading || !rawCV.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md w-full shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100"
                >
                    {loading ? "Enhancing..." : "✨ Enhance with AI"}
                </button>
            </div>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
    );
}
