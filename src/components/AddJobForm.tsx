import { useState } from "react";

export default function AddJobForm({ refreshApplications }: { refreshApplications: () => void }) {
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState("applied");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("❌ Authentication required. Please log in.");
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Ensures JWT is always present
                },
                credentials: "include", // Required for session-based authentication (if using NextAuth.js)
                body: JSON.stringify({ company, position, status }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("❌ API Error:", errorData);
                throw new Error(errorData.message || "Failed to add job.");
            }

            // Refresh job applications and reset form
            refreshApplications();
            setCompany("");
            setPosition("");
            setStatus("applied");

        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(`❌ ${error.message}`);
            } else {
                alert("❌ An unknown error occurred.");
            }
        }
    };



    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
            <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="text"
                placeholder="Position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
            >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="offer">Offer</option>
            </select>
            <button
                type="submit"
                className="bg-gradient text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition opacity-70 hover:opacity-100"
            >
                ➕ Add Job
            </button>
        </form>
    );
}
