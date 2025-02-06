import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import ResumePreview from "./ResumePreview";

interface Experience {
    company: string;
    role: string;
    dates: string;
    location: string;
    achievements: string[];
}

interface Education {
    degree: string;
    institution: string;
    dates: string;
}

interface Contact {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
}

interface ResumeData {
    name: string;
    contact: Contact;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

export default function ResumeEditor() {
    const [rawCV, setRawCV] = useState("");
    const [resume, setResume] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    const handleEnhance = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume: rawCV }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to enhance resume.");
            setResume(data.resume);
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
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resume),
            });
            alert("✅ Resume saved successfully!");
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

    const handleClear = () => {
        setRawCV("");
        setResume(null);
        setIsEditing(false);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center gradient-text opacity-90 mb-4">
                📄 My Resume
            </h2>

            {/* INITIAL STATE */}
            {!resume && (
                <div className="space-y-4">
                    <textarea
                        value={rawCV}
                        onChange={(e) => setRawCV(e.target.value)}
                        placeholder="Paste your raw CV here..."
                        className="w-full p-4 border rounded-md h-48"
                    />
                    <button
                        onClick={handleEnhance}
                        disabled={loading || !rawCV.trim()}
                        className="bg-green-500 text-white px-4 py-2 rounded-md w-full shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100"
                    >
                        {loading ? "Enhancing..." : "✨ Enhance with AI"}
                    </button>
                    <button
                        onClick={handleClear}
                        className="bg-red-500 text-white px-4 py-2 rounded-md w-full shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* PREVIEW STATE */}
            {resume && !isEditing && (
                <div>
                    <ResumePreview resume={resume} />
                    <div className="flex gap-4 mt-4 justify-center">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg"
                        >
                            📥 Export to PDF
                        </button>
                        <button
                            onClick={handleClear}
                            className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg"
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </div>
            )}

            {/* EDIT MODE */}
            {isEditing && resume && (
                <div className="space-y-4">
                    <input
                        type="text"
                        value={resume.name}
                        onChange={(e) => setResume({ ...resume, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full p-2 border rounded-md"
                    />

                    <textarea
                        value={resume.summary}
                        onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                        placeholder="Professional Summary"
                        className="w-full p-2 border rounded-md"
                    />

                    <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded-md w-full shadow-md hover:shadow-lg"
                    >
                        💾 Save Resume
                    </button>

                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md w-full shadow-md hover:shadow-lg"
                    >
                        ❌ Cancel Edit
                    </button>
                </div>
            )}

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
    );
}
