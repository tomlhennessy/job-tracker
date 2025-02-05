const features = [
    { title: "AI-Powered Resumes", desc: "Tailor your CV to any job instantly." },
    { title: "ATS Optimization", desc: "Beat the bots with smart keyword placement." },
    { title: "Auto Cover Letters", desc: "Generate professional letters in seconds." },
  ];

  export default function Features() {
    return (
      <section id="features" className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Appli.sh?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-white shadow-md rounded-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2 text-gradient">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
