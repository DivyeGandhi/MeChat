import React, { useState } from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ChatState } from '../../context/ChatProvider';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = ChatState();
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post('/api/user/login', { email, password }, config);
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // First set in localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Then update context
      setUser(data);
      
      // Show success message
      toast.success('Login successful!');
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        history.push('/chats');
        // Force a reload after navigation
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        toast.error('Cannot connect to server. Please make sure the backend server is running.');
      } else if (error.response) {
        // Server responded with an error
        if (error.response.status === 401) {
          toast.error('Invalid email or password');
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error('No response from server. Please try again.');
      } else {
        // Other errors
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-1 rounded-lg">
      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 field-label">Email address</label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 field-label">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isLoading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
