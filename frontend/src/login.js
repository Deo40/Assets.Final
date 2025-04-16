import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Spinner from '../src/spinner'; // Assuming you have a Spinner component

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { apiKey, user_id } = response.data;

      if (apiKey && user_id) {
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('user_id', user_id);
        navigate('/dashboard');
      } else {
        setError('Invalid server response. Missing API key or user ID.');
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 403) {
        setError(message || 'Your account is not yet verified by an admin.');
      } else {
        setError(message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
      style={{
        backgroundImage: `url('https://plus.unsplash.com/premium_photo-1674512540096-46b2ca19ef96?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
      }}
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-md w-full bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Sign In</h2>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-lg transition duration-200 ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center text-sm text-gray-600 mt-4">
              <span>Don't have an account? </span>
              <Link to="/register" className="text-blue-600 hover:text-blue-700">
                Register
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
