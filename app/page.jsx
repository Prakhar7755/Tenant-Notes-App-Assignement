export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Multi-Tenant Notes App</h1>
      <p className="text-lg mb-8 text-gray-600">
        Welcome! Please{" "}
        <a href="/login" className="text-blue-600 underline">
          Login
        </a>{" "}
        with one of the test accounts.
      </p>

      <div className="bg-gray-800 p-4 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-2">Test Accounts</h2>
        <ul className="text-left">
          <li>
            🔑 <b>admin@acme.test</b> / 123456
          </li>
          <li>
            👤 <b>user@acme.test</b> / 123456
          </li>
          <li>
            🔑 <b>admin@globex.test</b> / 123456
          </li>
          <li>
            👤 <b>user@globex.test</b> / 123456
          </li>
        </ul>
      </div>
    </main>
  );
}
