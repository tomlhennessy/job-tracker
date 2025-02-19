import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession(); // Check if user is logged in

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold gradient-text">
          Appli.sh 🚀
        </Link>

        <div className="space-x-6">
          <Link href="/#features" className="text-gray-600 hover:text-blue-500">
            Features
          </Link>

          {session ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">
                Dashboard
              </Link>
              <Link href="/dashboard#jobs" className="text-gray-600 hover:text-blue-500">
                Job Applications
              </Link>
              <Link href="/dashboard#resume" className="text-gray-600 hover:text-blue-500">
                AI Resume & Cover Letters
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
