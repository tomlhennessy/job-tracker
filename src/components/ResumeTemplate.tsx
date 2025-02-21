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

    const addExperience = () => {
        const newExperience: Experience = {
            id: Date.now().toString(),
            company: "",
            role: "",
            dates: "",
            location: "",
            achievements: [],
        };
        onUpdate({ ...resume, experience: [...resume.experience, newExperience] });
    };

    const removeExperience = (index: number) => {
        const updatedExperience = [...resume.experience];
        updatedExperience.splice(index, 1);
        onUpdate({ ...resume, experience: updatedExperience });
    };

    const addEducation = () => {
        const newEducation: Education = {
            degree: "",
            institution: "",
            dates: "",
        };
        onUpdate({ ...resume, education: [...resume.education, newEducation] });
    };

    const removeEducation = (index: number) => {
        const updatedEducation = [...resume.education];
        updatedEducation.splice(index, 1);
        onUpdate({ ...resume, education: updatedEducation });
    };

    const addSkill = () => {
        const skill = prompt("Enter a new skill:");
        if (skill) {
            onUpdate({ ...resume, skills: [...resume.skills, skill] });
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
                    placeholder="Full Name"
                />
                <input
                    type="text"
                    value={resume.contact.location || ""}
                    onChange={(e) => handleChange("contact", { ...resume.contact, location: e.target.value })}
                    className="text-gray-600 text-center w-full border-none focus:outline-none"
                    placeholder="Location (City, Country)"
                />
            </header>

            <section className="mt-6 border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
                <textarea
                    value={resume.summary || ""}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    className="w-full border-none focus:outline-none bg-transparent"
                    placeholder="Write a brief professional summary..."
                />
            </section>

            <section className="mt-6 border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
                {resume.experience.map((exp, index) => (
                    <div key={index} className="mt-4">
                        <input
                            type="text"
                            value={exp.role || ""}
                            onChange={(e) => {
                                const updatedExperience = [...resume.experience];
                                updatedExperience[index].role = e.target.value;
                                onUpdate({ ...resume, experience: updatedExperience });
                            }}
                            className="font-bold text-gray-800 w-full border-none focus:outline-none"
                            placeholder="Job Title"
                        />
                        <p className="text-sm text-gray-500">{exp.dates} | {exp.location}</p>
                        <button
                            onClick={() => removeExperience(index)}
                            className="text-red-500 text-sm hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    onClick={addExperience}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    ➕ Add Experience
                </button>
            </section>

            <section className="mt-6 border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                {resume.education.map((edu, index) => (
                    <div key={index} className="mt-4">
                        <input
                            type="text"
                            value={edu.degree || ""}
                            onChange={(e) => {
                                const updatedEducation = [...resume.education];
                                updatedEducation[index].degree = e.target.value;
                                onUpdate({ ...resume, education: updatedEducation });
                            }}
                            className="font-bold text-gray-800 w-full border-none focus:outline-none"
                            placeholder="Degree Name"
                        />
                        <p className="text-sm text-gray-500">{edu.institution} | {edu.dates}</p>
                        <button
                            onClick={() => removeEducation(index)}
                            className="text-red-500 text-sm hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    onClick={addEducation}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    ➕ Add Education
                </button>
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
                <button
                    onClick={addSkill}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md"
                >
                    ➕ Add Skill
                </button>
            </section>
        </div>
    );
}
