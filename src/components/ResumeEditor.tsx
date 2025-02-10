import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import ResumeTemplate from "./ResumeTemplate";

interface Contact {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
}

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
    createdAt: string;
}

export default function ResumeEditor() {
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [editableResume, setEditableResume] = useState<ResumeContent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    // Fetch all resume versions
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await fetch("/api/resume");
                const data = await response.json();
                setResumes(data);
                if (data.length > 0) {
                    setSelectedResume(data[0]); // Select latest resume by default
                    setEditableResume(JSON.parse(data[0].content)); // Load editable content
                }
            } catch (err) {
                console.error("Failed to fetch resumes:", err);
                setError("Failed to load resumes.");
            }
        };

        fetchResumes();
    }, []);

    // Auto-save changes when editableResume updates
    useEffect(() => {
        if (!editableResume || !selectedResume) return;

        const saveChanges = async () => {
            try {
                await fetch("/api/resume", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: selectedResume.id,
                        content: JSON.stringify(editableResume),
                    }),
                });
            } catch (error) {
                console.error("Auto-save failed:", error);
            }
        };

        const timeout = setTimeout(saveChanges, 1000); // Auto-save after 1 sec delay
        return () => clearTimeout(timeout); // Cleanup timeout
    }, [editableResume, selectedResume]);

    const handleFieldChange = (field: keyof ResumeContent, value: string | string[]) => {
        if (!editableResume) return;
        setEditableResume({ ...editableResume, [field]: value });
    };

    const handleExperienceChange = (index: number, key: keyof Experience, value: string) => {
        if (!editableResume) return;
        const updatedExperience = [...editableResume.experience];
        updatedExperience[index] = { ...updatedExperience[index], [key]: value };
        setEditableResume({ ...editableResume, experience: updatedExperience });
    };

    const handleAddExperience = () => {
        if (!editableResume) return;
        setEditableResume({
            ...editableResume,
            experience: [
                ...editableResume.experience,
                { company: "", role: "", dates: "", location: "", achievements: [] },
            ],
        });
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
            <label className="block mb-2 text-gray-700 font-semibold">Select Resume Version:</label>
            <select
                className="border p-2 rounded-md w-full mb-4 focus:ring-2 focus:ring-blue-500"
                value={selectedResume?.id || ""}
                onChange={(e) => {
                    const selected = resumes.find((r) => r.id === e.target.value);
                    if (selected) {
                        setSelectedResume(selected);
                        setEditableResume(JSON.parse(selected.content));
                    }
                }}
            >
                {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                        Version {resume.version} - {new Date(resume.createdAt).toLocaleDateString()} {resume.isAiGenerated ? "(AI)" : ""}
                    </option>
                ))}
            </select>

            {/* Toggle Between Edit/View Mode */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition"
                >
                    {isEditing ? "🔄 Switch to Preview" : "✏️ Edit Resume"}
                </button>
                <button
                    onClick={handleExportPDF}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition"
                >
                    📥 Export to PDF
                </button>
            </div>

            {/* EDIT MODE */}
            {isEditing && editableResume && (
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editableResume.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        placeholder="Full Name"
                        className="w-full p-2 border rounded-md"
                    />

                    <textarea
                        value={editableResume.summary}
                        onChange={(e) => handleFieldChange("summary", e.target.value)}
                        placeholder="Professional Summary"
                        className="w-full p-2 border rounded-md"
                    />

                    <h3 className="font-semibold text-lg">Work Experience</h3>
                    {editableResume.experience.map((exp, index) => (
                        <div key={index} className="border p-2 rounded-md">
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                                placeholder="Company"
                                className="w-full p-2 border rounded-md mb-2"
                            />
                            <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
                                placeholder="Role"
                                className="w-full p-2 border rounded-md mb-2"
                            />
                        </div>
                    ))}
                    <button onClick={handleAddExperience} className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg">
                        ➕ Add Experience
                    </button>
                </div>
            )}

            {/* PREVIEW MODE */}
            {!isEditing && selectedResume && <ResumeTemplate resume={editableResume!} />}

            {/* Error Display */}
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
    );
}
