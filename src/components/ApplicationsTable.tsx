import Link from "next/link";

export default function ApplicationsTable({ applications }: { applications: any[] }) {
  return (
    <table className="w-full border-collapse border">
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
          <tr key={app.id} className="text-center hover:bg-gray-50">
            <td className="border p-2">
              <Link href={`/ai-tools/${app.id}`}>
                <span className="text-blue-500 cursor-pointer hover:underline">
                  {app.company}
                </span>
              </Link>
            </td>
            <td className="border p-2">{app.position}</td>
            <td className="border p-2">{app.status}</td>
            <td className="border p-2">
              <button className="bg-red-500 text-white px-2 py-1 rounded">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
