import { useEffect, useState } from "react";
import ResumeTemplate from "./ResumeTemplate";

interface Contact {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
}

interface Experience {
    id: string;
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

interface ResumeContent {
    name: string;
    contact: Contact;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

interface ResumeData {
    id: string;
    userId: string;
    version: number;
    content: string;
    isAiGenerated: boolean;
    isLatest: boolean;
    createdAt: string;
}

export default function ResumeEditor() {
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [editableResume, setEditableResume] = useState<ResumeContent | null>(null);
    const [rawCV, setRawCV] = useState("");

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await fetch("/api/resume");
                const data = await response.json();
                setResumes(Array.isArray(data) ? data : []);
                if (data.length > 0) {
                    setSelectedResume(data[0]);
                    setEditableResume(JSON.parse(data[0].content));
                }
            } catch (err) {
                console.error("Failed to fetch resumes:", err);
            }
        };
        fetchResumes();
    }, []);



    useEffect(() => {
        if (!selectedResume) return;
        try {
            setEditableResume(JSON.parse(selectedResume.content));
        } catch (error) {
            console.error("Failed to parse resume content:", error);
            setEditableResume(null);
        }
    }, [selectedResume]);

    const handleUpdateResume = (updatedResume: ResumeContent) => {
        setEditableResume(updatedResume);
        fetch("/api/resume", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selectedResume?.id, content: JSON.stringify(updatedResume) }),
        }).catch((err) => console.error("Failed to save resume:", err));
    };

    const handleEnhance = async () => {
        if (!rawCV.trim()) return;

        console.log("Sending AI resume request..."); // ✅ Debugging

        try {
            const response = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "ai_generate",
                    userId: selectedResume?.userId,  // Ensure userId is included
                    rawCV,
                }),
            });

            console.log("📡 API Response Status:", response.status); // ✅ Debugging

            const data = await response.json();
            console.log("✅ AI Response Data:", data); // ✅ Debugging

            if (!response.ok) throw new Error(data.error || "AI resume generation failed");

            // ✅ Successfully generated AI resume
            setResumes([data.resume, ...resumes]); // Add new resume to state
            setSelectedResume(data.resume);
            setEditableResume(JSON.parse(data.resume.content));
            setRawCV("");
        } catch (error) {
            console.error("❌ AI Resume Generation Error:", error);
        }
    };


    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center gradient-text opacity-90 mb-4">📄 My Resume</h2>

            {resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                    <textarea
                        value={rawCV}
                        onChange={(e) => setRawCV(e.target.value)}
                        placeholder="Paste your raw CV here..."
                        className="w-full p-4 border rounded-md h-48"
                    />
                    <button
                        onClick={() => handleEnhance()}
                        disabled={!rawCV.trim()}
                        className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-opacity"
                    >
                        ✨ Generate Resume with AI
                    </button>
                </div>
            ) : (
                <ResumeTemplate resume={editableResume!} onUpdate={handleUpdateResume} />
            )}
        </div>
    );
}
