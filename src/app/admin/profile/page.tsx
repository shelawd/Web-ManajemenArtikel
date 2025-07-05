"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Tipe data untuk profil pengguna
type UserProfile = {
  username: string;
  role: string;
};

const ProfileInfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center bg-gray-100/60 p-4 rounded-lg">
    <span className="w-24 text-gray-500 font-medium">{label}</span>
    <span className="text-gray-500 mr-4">:</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
      } catch (error) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, [router]);

  const getInitial = (name: string = "") => {
    return name ? name[0].toUpperCase() : "";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Admin Profile
        </h1>
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
            {getInitial(user.username)}
          </div>
        </div>
        <div className="space-y-4">
          <ProfileInfoRow label="Username" value={user.username} />
          <ProfileInfoRow label="Password" value="********" />
          <ProfileInfoRow label="Role" value={user.role} />
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 