import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Login() {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session) {
            router.push("/dashboard")
        }
    }, [session, router])


    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-3xl font-bold mb-4'>Job Tracker</h1>
            <button
                onClick={() => signIn("google", {callbackUrl: "/dashboard"})}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
                Sign in with Google
            </button>
            <button
                onClick={() => signIn("google")}
                className="px-4 py-2 mt-2 bg-gray-800 text-white rounded-lg"
            >
                Sign in with GitHub
            </button>
            <button
                onClick={() => signIn("credentials", { email, password })}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
                Sign in with Email
            </button>
        </div>
    )
}
