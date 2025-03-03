import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddJobForm from "../components/AddJobForm";
import ApplicationsTable from "../components/ApplicationsTable";
import Layout from "../components/Layout";
import ResumeEditor from "@/components/ResumeEditor";

interface JobApplication {
    id: string;
    company: string;
    position: string;
    status: string;
    coverLetter?: string;
    jobDescription?: string;
    followUpDate?: string | null;
    createdAt: string;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<JobApplication[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "loading") {
            setLoading(true);
        } else {
            setLoading(false);
            fetchApplications();
        }
    }, [status, router]);

    const fetchApplications = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
                method: "GET",
                credentials: "include", // ✅ Ensures cookies are sent with the request
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("❌ API Error:", data);
                throw new Error(data.message || "Failed to fetch job applications.");
            }

            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("❌ Failed to fetch applications:", error);
            alert("❌ Could not load job applications. Please try again.");
        }
    };

    if (loading) return <p>Loading...</p>;

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">You are not logged in.</h1>
                <button
                    onClick={() => signIn()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto bg-card shadow-soft rounded-2xl p-8 mt-8 space-y-10">
                <h2 className="text-4xl font-bold text-center gradient-text opacity-90">Dashboard</h2>

                <AddJobForm refreshApplications={fetchApplications} />
                <ApplicationsTable applications={applications} refreshApplications={fetchApplications} />
                <ResumeEditor />
            </div>
        </Layout>
    );
}
