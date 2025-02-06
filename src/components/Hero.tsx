export default function Hero() {
    return (
      <section className="text-center py-20 bg-gray-50">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Build <span className="gradient-text">Your </span>  Dream AI <span className='gradient-text'>Resume</span>
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          Get hired faster 💨 Optimise your resume & cover letters with AI.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-gradient text-white rounded-md shadow-lg hover:shadow-xl transition">
            Create Free Resume
          </button>
          <button className="px-6 py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition">
            Learn More
          </button>
        </div>
      </section>
    );
  }
