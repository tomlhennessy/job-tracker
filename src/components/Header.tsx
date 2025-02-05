import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="shadow-subtle rounded-full flex justify-between items-center py-2 px-8 mt-6 mx-4">
      <h1 className="text-2xl font-bold gradient-text">Appli.sh 🚀</h1>
      {session && (
        <button
          onClick={() => signOut()}
          className="bg-primary hover:bg-accent opacity-80 text-white px-5 py-2 rounded-full shadow-soft transition"
        >
          Sign Out
        </button>
      )}
    </header>
  );
}
