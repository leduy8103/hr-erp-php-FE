// filepath: d:\React\hr-erp-frontend\src\components\Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      window.location.href = "/dashboard"; // Redirect to dashboard or any other page
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-5">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600">LOGIN</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-gray-800 mb-1">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">
              Please enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-5">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3 animate-fade-in">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} HRMS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;