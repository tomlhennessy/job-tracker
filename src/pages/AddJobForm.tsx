import { useState } from "react";

export default function AddJobForm({ refreshApplications }: { refreshApplications: () => void }) {
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState("applied");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company,       // ✅ Ensure these match the backend destructuring
                position,
                status,
            }),
        });

        if (res.ok) {
            refreshApplications();
            setCompany("");
            setPosition("");
            setStatus("applied");
        } else {
            alert("Failed to add job.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="border p-2 rounded"
            />
            <input
                type="text"
                placeholder="Position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="border p-2 rounded"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="offer">Offer</option>
            </select>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Add Job
            </button>
        </form>
    );
}
