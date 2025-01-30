import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react'

export default function Dashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "loading") {
            setLoading(true)
        } else {
            setLoading(false)
        }

    }, [status, router])

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
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-3xl font-bold'>Welcome, {session.user?.name}!</h1>
            <p>Email: {session.user?.email}</p>
            <button
                onClick={() => signOut()}
                className='px-4 py-2 mt-4 bg-red-500 text-white rounded-lg'
            >
                Sign Out
            </button>
        </div>
    )
}
