import React, { useState } from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const history = useHistory();

  const handleSignUp = async(e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const {data} = await axios.post('/api/user', {name, email, password}, config);
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Signup successful!');
      history.push('/chats');
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        toast.error('Cannot connect to server. Please make sure the backend server is running.');
      } else if (error.response) {
        // Server responded with an error
        if (error.response.status === 409) {
          toast.error('User already exists. Please login instead.');
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Signup failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error('No response from server. Please try again.');
      } else {
        // Other errors
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-1 rounded-lg">
      <form onSubmit={handleSignUp}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 field-label">Name</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 field-label">Email address</label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 field-label">Confirm Password</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
