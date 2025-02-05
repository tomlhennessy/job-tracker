import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gradient">Appli.sh 🚀</Link>
        <div className="space-x-4">
          <Link href="#features" className="text-gray-600 hover:text-blue-500">Features</Link>
          <Link href="/dashboard" className="px-4 py-2 bg-gradient text-white rounded-md shadow hover:opacity-90 transition">Go to Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}
