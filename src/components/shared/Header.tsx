'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/auth'; // Asumsi fungsi ini sudah ada
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

// Tipe data untuk profil pengguna
type UserProfile = {
  username: string;
  role: string;
};

export default function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      // Hanya fetch jika ada token
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await fetchUserProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to fetch user profile, logging out.", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    getUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  // Fungsi untuk mendapatkan inisial nama
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="w-full bg-white shadow-sm flex items-center justify-between px-6 py-3">
      {/* Logo */}
      <Link href="/">
        <span className="font-bold text-xl">Logoipsum</span>
      </Link>

      {/* User Profile Section */}
      <div>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {getInitials(user.username)}
                </div>
                <span className="font-medium text-gray-700 hidden sm:inline">{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
