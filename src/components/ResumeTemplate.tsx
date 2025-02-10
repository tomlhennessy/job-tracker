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
    github?: string;
    portfolio?: string;
}

interface ResumeData {
    name: string;
    contact: Contact;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

interface ResumeTemplateProps {
    resume: ResumeData;
}

export default function ResumeTemplate({ resume }: ResumeTemplateProps) {
    return (
        <div id="resume-preview" className="bg-white shadow-lg p-8 rounded-lg max-w-2xl mx-auto">
            {/* HEADER */}
            <header className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">{resume.name}</h1>
                <p className="text-gray-600">{resume.contact.location}</p>
                <div className="flex justify-center space-x-4 text-gray-600 mt-2 text-sm">
                    {resume.contact.email && <span>📧 {resume.contact.email}</span>}
                    {resume.contact.phone && <span>📞 {resume.contact.phone}</span>}
                    {resume.contact.linkedin && (
                        <a href={resume.contact.linkedin} className="text-blue-600 hover:underline">
                            LinkedIn
                        </a>
                    )}
                    {resume.contact.github && (
                        <a href={resume.contact.github} className="text-blue-600 hover:underline">
                            GitHub
                        </a>
                    )}
                    {resume.contact.portfolio && (
                        <a href={resume.contact.portfolio} className="text-blue-600 hover:underline">
                            Portfolio
                        </a>
                    )}
                </div>
            </header>

            {/* SUMMARY */}
            <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
                <p className="text-gray-700 mt-2">{resume.summary}</p>
            </section>

            {/* EXPERIENCE */}
            <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
                {resume.experience.map((exp, index) => (
                    <div key={index} className="mt-4">
                        <h3 className="font-bold text-gray-800">{exp.role} - {exp.company}</h3>
                        <p className="text-sm text-gray-500">{exp.dates} | {exp.location}</p>
                        <ul className="list-disc list-inside text-gray-700 mt-2">
                            {exp.achievements.map((ach, i) => (
                                <li key={i}>{ach}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            {/* EDUCATION */}
            <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                {resume.education.map((edu, index) => (
                    <div key={index} className="mt-4">
                        <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                        <p className="text-sm text-gray-500">{edu.institution} | {edu.dates}</p>
                    </div>
                ))}
            </section>

            {/* SKILLS */}
            <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <p className="text-gray-700 mt-2">{resume.skills.join(", ")}</p>
            </section>
        </div>
    );
}
