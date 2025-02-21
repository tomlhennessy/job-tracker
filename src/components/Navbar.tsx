import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession(); // Check login state

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

          {status === "loading" ? (
            <span className="text-gray-500">Loading...</span>
          ) : session ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  try {
                    await signOut({ callbackUrl: "/" });
                  } catch (error) {
                    console.error("❌ Logout failed:", error);
                    alert("❌ Logout failed. Please try again.");
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()} // Use signIn() instead of router.push("/login")
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
