import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-blue-600 py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-white text-sm gap-2 sm:flex-row sm:gap-2 sm:justify-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Logoipsum</span>
        </div>
        <span className="opacity-80">© 2025 Blog genzet. All rights reserved.</span>
      </div>
    </footer>
  );
}
