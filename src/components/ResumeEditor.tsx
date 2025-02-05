import { useEffect, useState } from "react"

export default function ResumeEditor() {
    const [resume, setResume] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchResume = async () => {
            const res = await fetch("/api/resume")
            const data = await res.json()
            setResume(data || "")
        }

        fetchResume()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        await fetch("/api/resume", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resume })
        })
        setLoading(false)
        alert("Resume saved successfully!")
    }

    const handleEnhance = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to enhance resume.");
            }

            setResume(data.resume);
        } catch (error: unknown) {
            console.error(error);
            // ✅ Check if 'error' is an instance of Error
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className='bg-white shadow-md rounded-lg p-6 mt-6'>
            <h2 className='text-2xl font-bold text-center gradient-text opacity-90 mb-4'>My Resume</h2>
            <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className='w-full border rounded-md p-4 h-64 focus:ring-2 focus:ring-blue-500'
                placeholder="Place your resume here..."
            />

            <div className='flex gap-4 mt-4 justify-center'>
                <button
                onClick={handleEnhance}
                disabled={loading}
                className='bg-primary text-white px-3 py-1 rounded-md shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100'
                >
                    {loading ? "Enhancing..." : "✨ Enhance with AI"}
                </button>

                <button
                onClick={handleSave}
                disabled={loading}
                className='bg-green-500 text-white px-3 py-1 rounded-md shadow-md hover:shadow-lg transition opacity-90 hover:opacity-100'
                >
                    {loading ? "Saving..." : "💾 Save Resume"}
                </button>
                {error && <p className="text-red-500">{error}</p>}
            </div>

        </div>
    )
}
