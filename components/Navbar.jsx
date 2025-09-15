"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    window.location.reload();
  };

  return (
    <header className="bg-[#0f0e0e] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[90px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-white">NotesApp</h1>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-white">
          {!user && (
            <>
              <Link
                href="/login"
                className="hover:text-blue-500 transition duration-200 font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hover:text-blue-500 transition duration-200 font-medium"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                href="/notes"
                className="hover:text-blue-500 transition duration-200 font-medium"
              >
                Notes
              </Link>

              {/* Only show upgrade button for admin */}
              {user.role === "admin" && (
                <Link
                  href={`/upgrade`} // upgrade button
                  className="hover:text-blue-500 transition duration-200 font-medium"
                >
                  Upgrade to Pro
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-400 text-white px-4 py-2 rounded-md font-medium transition duration-200"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
