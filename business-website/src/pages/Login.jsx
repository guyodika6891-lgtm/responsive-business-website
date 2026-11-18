import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Could not sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-xl border border-gray-200 shadow-sm">
          
          <div className="mb-8">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Welcome Back
            </h2>
            <h1 className="text-4xl font-bold text-[#0f172a] mb-2">
              Good to see you.
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to see your account and saved inquiries.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-6 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c9070]"
                placeholder="admin@northstar.local"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7c9070]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2b4034] text-white font-bold py-3 rounded-md hover:bg-[#1f2f26] transition disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            New here?{" "}
            <Link to="/register" className="text-[#7c9070] hover:underline font-bold">
              Create an account
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Demo admin: <strong className="text-gray-600">admin@northstar.local</strong> (or admin@example.com) / any non-empty password
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}