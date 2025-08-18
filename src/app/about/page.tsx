export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Subject: CSE3CWA / CSE5006
      </p>

      <section>
        <h2 className="text-xl font-semibold">Student Details</h2>
        <ul className="list-disc pl-6 mt-2">
          <li><strong>Name:</strong> YOUR NAME</li>
          <li><strong>Student Number:</strong> YOUR-STUDENT-NUMBER</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How to use this website</h2>
        <p className="mt-2">
          This site generates copy-pasteable HTML5 + JS (with inline CSS) that can be used in Moodle.
        </p>
        <div className="aspect-video w-full mt-4 border rounded">
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
