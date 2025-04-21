import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatProvider } from './context/ChatProvider';

function App() {
  return (
    <Router>
      <ChatProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chats" element={<ChatPage />} />
            </Routes>
            <ThemeSwitcher />
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </ThemeProvider>
      </ChatProvider>
    </Router>
  );
}

export default App;
