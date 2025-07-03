import Image from 'next/image';

export default function Header() {
  // Ganti dengan logic auth/user context jika sudah ada
  const userName = 'John Doe';

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg hidden sm:inline">Logoipsum</span>
      </div>
      {/* User Name */}
      <div className="text-gray-700 font-medium">{userName}</div>
    </header>
  );
}
