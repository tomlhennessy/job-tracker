import { useRouter } from "next/router";
import { useState } from "react";


export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name })
        })

        if (res.ok) {
            alert("Account created! You can now log in.")
            router.push("/login")
        } else {
            alert("Registration failed")
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-3xl font-bold mb-4'>Register</h1>
            <form onSubmit={handleRegister} className='flex flex-col'>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type='submit' className='bg-blue-500 text-white px-4 py-2 mt-2'>Register</button>
            </form>
        </div>
    )
}
