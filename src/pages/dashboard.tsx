import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddJobForm from "../components/AddJobForm";
import ApplicationsTable from "../components/ApplicationsTable";
import Layout from "../components/Layout";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);

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
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setApplications(data);
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
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h2 className="text-3xl font-bold mb-4 text-center">Dashboard</h2>
                <AddJobForm refreshApplications={fetchApplications} />
                <ApplicationsTable applications={applications} refreshApplications={fetchApplications} />
            </div>
        </Layout>
    );
}
