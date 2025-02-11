import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import ResumeTemplate from "./ResumeTemplate";
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Contact {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
}

interface Experience {
    id: string; // ✅ Added unique ID for drag & drop support
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

// 🏗 Drag & Drop Experience Item Component
const ExperienceItem = ({ experience }: { experience: Experience }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: experience.id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className="border p-2 rounded-md bg-gray-100 cursor-pointer"
        >
            <h4 className="font-bold">{experience.role} at {experience.company}</h4>
            <p className="text-sm">{experience.dates} - {experience.location}</p>
        </div>
    );
};

export default function ResumeEditor() {
    const [rawCV, setRawCV] = useState("");
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [editableResume, setEditableResume] = useState<ResumeContent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // ✅ Ensure Hooks are NOT called conditionally
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    // Fetch all resume versions
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await fetch("/api/resume");
                const data = await response.json();
                setResumes(data);
                if (data.length > 0) {
                    setSelectedResume(data[0]);
                    setEditableResume(JSON.parse(data[0].content));
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
            setSaving(true);
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
            } finally {
                setSaving(false);
            }
        };

        const timeout = setTimeout(saveChanges, 1000);
        return () => clearTimeout(timeout);
    }, [editableResume, selectedResume]);

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

            setResumes([data.resume, ...resumes]);
            setSelectedResume(data.resume);
            setEditableResume(JSON.parse(data.resume.content));
            setRawCV("");
        } catch (error) {
            if (error instanceof Error) setError(error.message);
            else setError("An unexpected error occurred.");
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

    // ✅ Updated Drag and Drop Handler (No More `any`)
    const handleDragEnd = (event: DragEndEvent) => {
        if (!editableResume || !event.active || !event.over) return;

        const activeId = String(event.active.id); // Convert UniqueIdentifier to string
        const overId = String(event.over.id);

        const oldIndex = editableResume.experience.findIndex(exp => exp.id === activeId);
        const newIndex = editableResume.experience.findIndex(exp => exp.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const sortedExperience = arrayMove(editableResume.experience, oldIndex, newIndex);
            setEditableResume({ ...editableResume, experience: sortedExperience });
        }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center gradient-text opacity-90 mb-4">
                📄 My Resume
            </h2>

            {/* RAW CV INPUT */}
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
                    className="bg-blue-500 text-white px-4 py-2 rounded-md w-full shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100 mt-2"
                >
                    {loading ? "Enhancing..." : "✨ Enhance with AI"}
                </button>
            </div>

            {/* Toggle Between Edit/View Mode */}
            <div className="flex justify-center gap-4 mb-4 mt-6">
                <button
                    onClick={() => setIsEditing((prev) => !prev)}
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

            {/* Drag & Drop Sorting */}
            {isEditing && editableResume && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={editableResume.experience.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
                        {editableResume.experience.map(exp => (
                            <ExperienceItem key={exp.id} experience={exp} />
                        ))}
                    </SortableContext>
                </DndContext>
            )}

            {/* PREVIEW MODE */}
            {!isEditing && selectedResume && <ResumeTemplate resume={editableResume!} />}

            {saving && <p className="text-gray-500 text-center mt-2">💾 Saving changes...</p>}
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
    );
}
}
