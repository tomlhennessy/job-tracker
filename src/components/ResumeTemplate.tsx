
interface Experience {
    id: string;
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
    onUpdate: (updatedResume: ResumeData) => void;
}

export default function ResumeTemplate({ resume, onUpdate }: ResumeTemplateProps) {
    const handleChange = (field: keyof ResumeData, value: string | Contact) => {
        if (field === "contact" && typeof value !== "string") {
            onUpdate({ ...resume, contact: value });
        } else {
            onUpdate({ ...resume, [field]: value as string });
        }
    };

    return (
        <div id="resume-preview" className="bg-white shadow-lg p-8 rounded-lg max-w-3xl mx-auto border">
            <header className="text-center border-b pb-4">
                <input
                    type="text"
                    value={resume.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-4xl font-bold text-gray-900 text-center w-full border-none focus:outline-none"
                />
                <input
                    type="text"
                    value={resume.contact.location}
                    onChange={(e) => handleChange("contact", { ...resume.contact, location: e.target.value })}
                    className="text-gray-600 text-center w-full border-none focus:outline-none"
                />
            </header>

            <section className="mt-6 border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
                <textarea
                    value={resume.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    className="w-full border-none focus:outline-none bg-transparent"
                />
            </section>

            <section className="mt-6 border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
                {resume.experience.map((exp, index) => (
                    <div key={index} className="mt-4">
                        <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                                const updatedExperience = [...resume.experience];
                                updatedExperience[index].role = e.target.value;
                                onUpdate({ ...resume, experience: updatedExperience });
                            }}
                            className="font-bold text-gray-800 w-full border-none focus:outline-none"
                        />
                        <p className="text-sm text-gray-500">{exp.dates} | {exp.location}</p>
                    </div>
                ))}
            </section>

            <section className="mt-6 border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                {resume.education.map((edu, index) => (
                    <div key={index} className="mt-4">
                        <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                                const updatedEducation = [...resume.education];
                                updatedEducation[index].degree = e.target.value;
                                onUpdate({ ...resume, education: updatedEducation });
                            }}
                            className="font-bold text-gray-800 w-full border-none focus:outline-none"
                        />
                        <p className="text-sm text-gray-500">{edu.institution} | {edu.dates}</p>
                    </div>
                ))}
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                    {resume.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}
