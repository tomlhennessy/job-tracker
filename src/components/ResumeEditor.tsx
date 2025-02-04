import { useEffect, useState } from "react"

export default function ResumeEditor() {
    const [resume, setResume] = useState("")
    const [loading, setLoading] = useState(false)

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
        setLoading(true)
        const res = await fetch("/api/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ resume })
        })
        const data = await res.json()
        setResume(data.resume)
        setLoading(false)
        alert("🚀 Resume enhanced!")
    }

    return (
        <div className='bg-white shadow-md rounded-lg p-6 mt-6'>
            <h2 className='text-2xl font-bold mb-4'>📄 My Resume</h2>
            <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className='w-full border rounded-md p-4 h-64 focus:ring-2 focus:ring-blue-500'
                placeholder="Place your resume here..."
            />

            <div className='flex gap-4 mt-4'>
                <button
                onClick={handleEnhance}
                disabled={loading}
                className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition'
                >
                    {loading ? "Enhancing..." : "✨ Enhance with AI"}
                </button>

                <button
                onClick={handleSave}
                disabled={loading}
                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition'
                >
                    {loading ? "Saving..." : "💾 Save Resume"}
                </button>
            </div>

        </div>
    )
}
