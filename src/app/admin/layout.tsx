'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, LogOut, PanelsTopLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Komponen Sidebar
function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: '/admin/articles', label: 'Articles', icon: Newspaper },
    { href: '/admin/categories', label: 'Category', icon: PanelsTopLeft },
  ];

  return (
    <aside className="w-64 bg-blue-600 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Logoipsum</h1>
      </div>
      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-blue-700'
                  : 'hover:bg-blue-700/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <Button variant="ghost" className="w-full justify-start gap-3 text-white hover:bg-blue-700/50 hover:text-white">
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

// Komponen Header
function Header() {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-8">
      <h2 className="text-xl font-semibold">Articles</h2>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">James Dean</p>
          <p className="text-sm text-gray-500">Admin</p>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-blue-600">
          JD
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Di sini Anda bisa menambahkan logika otentikasi admin
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}