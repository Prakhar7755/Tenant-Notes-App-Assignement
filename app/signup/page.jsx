"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenantSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // redirect to login after success
      router.push("/login");
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
        {/* USERNAME INPUT*/}
        <div className="w-full mb-4">
          <input
            type="text"
            name="username"
            aria-label="Username"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* EMAIL INPUT */}
        <div className="w-full mb-4">
          <input
            type="email"
            name="email"
            aria-label="Email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* PASSWORD INPUT */}
        <div className="w-full mb-4">
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* TENANT INPUT */}
        <div className="w-full mb-4">
          <input
            type="text"
            name="tenantSlug"
            aria-label="Tenant Slug"
            placeholder="Tenant Slug (e.g., acme)"
            required
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {error && <p className="text-red-500 mb-2 w-full">{error}</p>}

        <p className="text-gray-600 text-sm mb-4 w-full text-left">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-300 hover:underline">
            Login
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md bg-blue-700 hover:bg-blue-500 transition-colors text-white font-semibold ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
