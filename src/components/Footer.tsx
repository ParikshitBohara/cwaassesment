type Props = {
  studentNo: string;
  name: string;
  date?: string; // keep static to avoid hydration issues
};

export default function Footer({ name, studentNo, date = "18/08/2025" }: Props) {
  return (
    <footer className="mt-auto py-6 text-center text-sm text-theme-secondary bg-theme-primary border-t border-theme-primary backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="">
          © 2025 {name}, {studentNo}, {date}
        </div>
      </div>
    </footer>
  );
}
