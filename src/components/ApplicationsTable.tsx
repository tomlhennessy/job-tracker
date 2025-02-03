// Define the Job type based on the fields you're using
interface Job {
  id: string;
  company: string;
  position: string;
  status: string;
}

interface ApplicationsTableProps {
  applications: Job[];
  refreshApplications: () => void;
}

export default function ApplicationsTable({ applications, refreshApplications }: ApplicationsTableProps) {
    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/jobs?id=${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            refreshApplications();
        } else {
            alert("Failed to delete job.");
        }
    };

    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Company</th>
                        <th className="border p-2">Position</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((app) => (
                        <tr key={app.id} className="text-center">
                            <td className="border p-2">{app.company}</td>
                            <td className="border p-2">{app.position}</td>
                            <td className="border p-2">{app.status}</td>
                            <td className="border p-2">
                                <button
                                    onClick={() => handleDelete(app.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
