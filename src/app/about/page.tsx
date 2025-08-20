export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-theme-primary">About</h1>
      <p className="text-lg text-theme-secondary">
        Subject: CSE3CWA / CSE5006
      </p>

      <section className="card">
        <h2 className="text-2xl font-semibold text-theme-primary mb-4">Student Details</h2>
        <ul className="list-disc pl-6 space-y-2 text-theme-secondary">
          <li><strong className="text-theme-primary">Name:</strong> Parikshit Bohara</li>
          <li><strong className="text-theme-primary">Student Number:</strong> 21885934</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-theme-primary mb-4">How to use this website</h2>
        <p className="text-theme-secondary mb-6 leading-relaxed">
          This site generates copy-pasteable HTML5 + JS (with inline CSS) that can be used in Moodle.
          The interface provides an intuitive way to create interactive content for your courses.
        </p>
        <div className="aspect-video w-full border border-theme-primary rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Demo video"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
