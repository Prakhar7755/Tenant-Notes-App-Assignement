"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/notes");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-900">
      <form
        onSubmit={submitForm}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-[#0f0e0e] p-6 sm:p-8 rounded-lg shadow-xl shadow-black/50 flex flex-col items-center"
      >
        {/* Optional Logo */}
        {/* <img src="/logo.png" className="w-32 sm:w-40 lg:w-48 mb-6" alt="logo" /> */}

  {/*       <p className="text-gray-400 mb-4">
          Use a@a.com and 123456 for Guest Admin experience
        </p> */}

        {error && <p className="text-red-500 mb-2 w-full">{error}</p>}

        {/* EMAIL INPUT */}
        <div className="w-full mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* PASSWORD FIELD */}
        <div className="w-full mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <p className="text-gray-600 text-sm mb-4 w-full text-left">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-300 hover:underline">
            Sign Up
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md bg-blue-700 hover:bg-blue-500 transition-colors text-white font-semibold ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
