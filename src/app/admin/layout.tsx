"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  LogOut,
  PanelsTopLeft,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchUserProfile } from "@/lib/auth";
import LogoutDialog from "@/components/shared/LogoutDialog";

function Sidebar() {
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navItems = [
    { href: "/admin/articles", label: "Articles", icon: Newspaper },
    { href: "/admin/categories", label: "Category", icon: PanelsTopLeft },
    { href: "/admin/profile", label: "Profile", icon: UserIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

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
                  ? "bg-blue-700"
                  : "hover:bg-blue-700/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </span>
          </Link>
        ))}

        {/* Logout pakai dialog */}
        <button
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-white hover:bg-blue-700/50 text-left"
          onClick={() => setIsLogoutOpen(true)}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
        <LogoutDialog
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      </nav>
    </aside>
  );
}

function Header({ username }: { username: string }) {
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-8">
      <h2 className="text-xl font-semibold">Articles</h2>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">{username}</p>
          <p className="text-sm text-gray-500">Admin</p>
        </div>
        <Link href="/admin/profile">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-blue-600 cursor-pointer hover:ring-2 ring-blue-400">
            {username ? username[0].toUpperCase() : ""}
          </div>
        </Link>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile()
      .then((profile) => {
        if (profile.role.toLowerCase() !== "admin") {
          router.push("/");
        } else {
          setUsername(profile.username);
        }
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Loading...</p>; 

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header username={username} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
