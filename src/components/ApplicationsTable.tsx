import { Job } from "../types/job";
import { useRouter } from "next/router";

export default function ApplicationsTable({
    applications,
    refreshApplications,
}: {
    applications: Job[];
    refreshApplications: () => void;
}) {
    const router = useRouter();

    const handleViewJob = (id: string) => {
        router.push(`/ai-tools/${id}`);
    };

    const handleDeleteJob = async (id: string) => {
        const confirmDelete = window.confirm(
            "⚠️ Are you sure you want to delete this job? This will permanently remove all saved details, including cover letters."
        );

        if (confirmDelete) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?id=${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Job deleted successfully.");
                    refreshApplications();
                } else {
                    alert("Failed to delete the job. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting job:", error);
                alert("An error occurred while deleting the job.");
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-50 shadow-lg">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-2">Company</th>
                        <th className="px-4 py-2">Position</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                {Array.isArray(applications) && applications.length > 0 ? (
                    applications.map((app) => (
                        <tr key={app.id} className="border-t hover:bg-gray-50 transition">
                            <td className="px-4 py-2">{app.company}</td>
                            <td className="px-4 py-2">{app.position}</td>
                            <td className="px-4 py-2 capitalize">{app.status}</td>
                            <td className="px-4 py-2 flex gap-4 justify-center my-2 mx-auto">
                                <button
                                    onClick={() => handleViewJob(app.id)}
                                    className="bg-gradient text-white px-5 py-1 rounded-md shadow-md hover:shadow-lg transition opacity-80 hover:opacity-100"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleDeleteJob(app.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-md shadow-md hover:bg-red-600 transition"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="text-center text-gray-500 py-4">
                            No applications
                        </td>
                    </tr>
                )}
            </tbody>

            </table>
        </div>
    );
}
