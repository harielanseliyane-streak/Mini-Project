import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar         from './components/Navbar';
import Chatbot        from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Colleges         from './pages/Colleges';
import CollegeDetail    from './pages/CollegeDetail';
import StudentDashboard from './pages/StudentDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import CompareColleges  from './pages/CompareColleges';
import Quiz             from './pages/Quiz';

// Scroll reset component on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center pt-16 text-slate-400 gap-4">
    <span className="text-7xl font-mono">404</span>
    <p className="text-xl font-heading text-white">Page not found</p>
    <a href="/" className="btn-primary px-6 py-2.5">Go Home</a>
  </div>
);

const App = () => {
  useEffect(() => {
    // Initialize light theme as default and migrate from dark if previously set
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === 'dark') {
      savedTheme = 'light';
      localStorage.setItem('theme', 'light');
    }
    if (savedTheme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-bgDark body-bg transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/"                    element={<Home />} />
            <Route path="/login"               element={<Login />} />
            <Route path="/register"            element={<Register />} />
            <Route path="/colleges"            element={<Colleges />} />
            <Route path="/colleges/:id"        element={<CollegeDetail />} />
            <Route path="/compare"             element={<CompareColleges />} />
            
            {/* Student Protected Routes */}
            <Route path="/student/dashboard"   element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/quiz"                element={<ProtectedRoute role="student"><Quiz /></ProtectedRoute>} />
            
            {/* College Management Protected Routes */}
            <Route path="/college/dashboard"   element={<ProtectedRoute role="college"><CollegeDashboard /></ProtectedRoute>} />
            
            {/* Super Admin Protected Routes */}
            <Route path="/admin/dashboard"     element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            
            {/* Auxiliary static pages */}
            <Route path="/about"               element={<div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto text-textSecondaryDark"><h1 className="font-heading text-3xl font-bold text-white mb-4">About InfoHub</h1><p>InfoHub is an AI-powered College Discovery, Event Management, Scholarship, Internship, and Career Guidance ecosystem connecting students across India with premium educational resources.</p></div>} />
            <Route path="/contact"             element={<div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto text-textSecondaryDark"><h1 className="font-heading text-3xl font-bold text-white mb-4">Contact Us</h1><p>Email: contact@info-hub.in | Support: support@info-hub.in | Hotline: +91 44-2235-7004</p></div>} />
            <Route path="/help"                element={<div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto text-textSecondaryDark"><h1 className="font-heading text-3xl font-bold text-white mb-4">Help &amp; Support</h1><p>Please use our floating AI assistant chatbot in the bottom right corner of the page for real-time recommendations, career guides, or college cutoff enquiries.</p></div>} />
            <Route path="*"                    element={<NotFound />} />
          </Routes>
          <Chatbot />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
