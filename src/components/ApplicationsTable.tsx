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
                    {applications.map((app) => (
                        <tr key={app.id} className="border-t">
                            <td className="px-4 py-2">{app.company}</td>
                            <td className="px-4 py-2">{app.position}</td>
                            <td className="px-4 py-2 capitalize">{app.status}</td>
                            <td className="px-4 py-2 flex gap-2 justify-center">
                                <button
                                    onClick={() => handleViewJob(app.id)}
                                    className="bg-gradient text-white px-5 py-1 rounded-md shadow-md hover:shadow-lg transition opacity-70 hover:opacity-100"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => refreshApplications()}
                                    className="bg-red-500 text-white px-3 py-2 rounded-md shadow-md hover:shadow-lg transition opacity-70 hover:opacity-100"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
