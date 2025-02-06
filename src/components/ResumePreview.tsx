interface Experience {
    company: string;
    role: string;
    dates: string;
    location: string;
    achievements: string[];
}

interface Education {
    degree: string;
    institution: string;
    dates: string;
}

interface Contact {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
}

interface ResumeData {
    name: string;
    contact: Contact;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

interface ResumePreviewProps {
    resume: ResumeData;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
    return (
        <div className="p-6 bg-gray-50 rounded-md shadow-md" id="resume-preview">
            <h1 className="text-3xl font-bold text-gray-900">{resume.name}</h1>
            <div className="flex justify-center space-x-4 text-sm text-gray-600 mt-2">
                {resume.contact?.location && <span>📍 {resume.contact.location}</span>}
                {resume.contact?.email && <span>📧 {resume.contact.email}</span>}
                {resume.contact?.phone && <span>📞 {resume.contact.phone}</span>}
                {resume.contact?.linkedin && <span>🔗 {resume.contact.linkedin}</span>}
            </div>

            <p className="mt-4 text-gray-700">{resume.summary}</p>

            <h2 className="text-xl font-semibold mt-6">Professional Experience</h2>
            {resume.experience?.length > 0 ? (
                resume.experience.map((exp, index) => (
                    <div key={index} className="mt-2">
                        <h3 className="font-bold">{exp.role} at {exp.company}</h3>
                        <p>{exp.location} | {exp.dates}</p>
                        <ul className="list-disc ml-6">
                            {exp.achievements.map((ach, i) => (
                                <li key={i}>{ach}</li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No professional experience added yet.</p>
            )}

            <h2 className="text-xl font-semibold mt-6">Education</h2>
            {Array.isArray(resume.education) && resume.education.length > 0 ? (
                resume.education.map((edu, index) => (
                    <div key={index} className="mt-2">
                        <h3 className="font-bold">{edu.degree}</h3>
                        <p>{edu.institution} | {edu.dates}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No education details added yet.</p>
            )}

            <h2 className="text-xl font-semibold mt-6">Skills</h2>
            {Array.isArray(resume.skills) && resume.skills.length > 0 ? (
                <p>{resume.skills.join(", ")}</p>
            ) : (
                <p className="text-gray-500">No skills listed yet.</p>
            )}
        </div>
    );
}
