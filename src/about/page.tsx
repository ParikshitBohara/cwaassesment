export const metadata = {
  title: "About | Assignment 1",
  description: "Student details and how to use this website",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">About</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Subject: CSE3CWA / CSE5006
        </p>
      </header>

      <section aria-labelledby="student">
        <h2 id="student" className="text-xl font-semibold">Student details</h2>
        <ul className="mt-2 list-disc pl-6">
          <li><strong>Name:</strong> YOUR NAME</li>
          <li><strong>Student Number:</strong> YOUR-STUDENT-NO</li>
        </ul>
      </section>

      <section aria-labelledby="howto">
        <h2 id="howto" className="text-xl font-semibold">How to use this website</h2>
        <p className="mt-2">
          This site will generate copy-pasteable HTML5 + JS (with inline CSS) you can use in Moodle.
        </p>

        {/* Replace the src with your real video later */}
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
          <iframe
            title="How to use this website"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
