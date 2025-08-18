type Props = {
  studentNo: string;
  name: string;
  date?: string; // keep static to avoid hydration issues
};

export default function Footer({ name, studentNo, date = "18/08/2025" }: Props) {
  return (
    <footer className="mt-auto py-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
      © 2025 {name}, {studentNo}, {date}
    </footer>
  );
}
