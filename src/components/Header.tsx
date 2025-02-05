import { signOut, useSession } from "next-auth/react"

export default function Header() {
    const { data: session } = useSession()

    return (
        <header className='bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center'>
            <h1 className="text-2xl font-bold">Appli.sh</h1>
            {session && (
                <button
                    onClick={() => signOut()}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
                >
                    Sign Out
                </button>
            )}
        </header>
    )
}
