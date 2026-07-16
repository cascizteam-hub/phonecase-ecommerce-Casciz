export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} CaseCraft. All rights reserved.</p>
        <p>Made for phone cases that survive drops.</p>
      </div>
    </footer>
  );
}
