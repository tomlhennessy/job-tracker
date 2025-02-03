import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react'
import AddJobForm from "./AddJobForm";
import ApplicationsTable from "./ApplicationsTable";

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [applications, setApplications] = useState([])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "loading") {
            setLoading(true)
        } else {
            setLoading(false)
            fetchApplications()
        }

    }, [status, router])

    const fetchApplications = async () => {
        const res = await fetch("/api/jobs")
        const data = await res.json()
        setApplications(data)
    }

    if (loading) {
        return (
            <p>Loading...</p>
        )
    }


    if (!session) {
        return (
            <div className='flex flex-col items-center justify-center h-screen'>
                <h1 className='text-2xl font-bold'>You are not logged in.</h1>
                <button
                onClick={() => signIn()}
                className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg'
                >

                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 flex flex-col">
                <h1 className="text-3xl font-bold mb-4 text-center">Job Tracker Dashboard</h1>

                <button
                    onClick={() => signOut()}
                    className="bg-red-500 text-white px-4 py-2 rounded-md mb-4 "
                    >
                        Sign Out
                </button>

                <div className='flex flex-col justify-center items-center'>


                    <AddJobForm refreshApplications={fetchApplications} />
                    <ApplicationsTable applications={applications} refreshApplications={fetchApplications} />
                </div>
            </div>
        </div>
    )
}
