import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Login() {
    const { data: session } = useSession();
    const router = useRouter();

    // Define state variables for email and password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

    const handleEmailLogin = async () => {
        // Use state variables for authentication
        const result = await signIn("credentials", {
            email,
            password,
            callbackUrl: "/dashboard",
            redirect: false, // Prevent full page reload
        });

        if (result?.error) {
            alert("Login failed: " + result.error);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-4xl font-bold text-center gradient-text p-6'>Appli.sh</h1>

            <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
                Sign in with Google
            </button>

            <button
                onClick={() => signIn("github")}
                className="px-4 py-2 mt-2 bg-gray-800 text-white rounded-lg"
            >
                Sign in with GitHub
            </button>

            {/* Input fields for email & password */}
            <div className="flex flex-col gap-2 mt-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                />
                <button
                    onClick={handleEmailLogin}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg"
                >
                    Sign in with Email
                </button>
            </div>
        </div>
    );
}
