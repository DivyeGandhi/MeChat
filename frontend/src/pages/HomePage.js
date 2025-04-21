import React, { useState } from 'react'
import { LuSquareCheck, LuUser } from "react-icons/lu"
import Login from "../components/Authentication/Login"
import Signup from '../components/Authentication/Signup'
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';

const HomePage = () => {
  const history = useHistory();

  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        if (user) {
          history.push("/chats");
        }
      } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
        localStorage.removeItem("userInfo");
      }
    }
  }, [history]);

  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="max-w-xl mx-auto py-5 px-4 relative z-10">
      {/* Header Box */}
      <div className="flex justify-center items-center p-5 bg-white/10 backdrop-blur-sm w-full my-10 rounded-2xl border border-gray-200/30 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold font-sans text-[var(--foreground)] mechat-tab">
          MeChat App
        </h1>
      </div>

      {/* Tabs Box */}
      <div className="bg-white/10 backdrop-blur-sm w-full p-5 rounded-2xl border border-gray-200/30 shadow-lg">
        <div className="w-full">
          {/* Tab Buttons */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 rounded-xl p-1 w-11/12 md:w-7/12 flex justify-around">
              <button
                onClick={() => setActiveTab('login')}
                className={`px-4 py-2 rounded-xl text-sm md:text-base flex items-center tab-title ${
                  activeTab === 'login' ? 'bg-white/80 text-black font-bold' : 'text-[var(--foreground)]'
                }`}
              >
                <LuUser className="mr-2" />
                Login
              </button>

              <button
                onClick={() => setActiveTab('signup')}
                className={`px-4 py-2 rounded-xl text-sm md:text-base flex items-center tab-title ${
                  activeTab === 'signup' ? 'bg-white/80 text-black font-bold' : 'text-[var(--foreground)]'
                }`}
              >
                <LuSquareCheck className="mr-2" />
                Signup
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="w-full mt-4">
            {activeTab === 'login' && <Login />}
            {activeTab === 'signup' && <Signup />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;
