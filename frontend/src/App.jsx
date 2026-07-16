import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar         from './components/Navbar';
import Chatbot        from './components/Chatbot';
import LiveBulletins  from './components/LiveBulletins';
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
    <p className="text-xl font-heading text-slate-800">Page not found</p>
    <a href="/" className="btn-primary px-6 py-2.5">Go Home</a>
  </div>
);

// Framer Motion Page Transition Wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, scale: 0.985 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 1.01 }}
    transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
    className="page-transition-wrapper"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                    element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login"               element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register"            element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/colleges"            element={<PageWrapper><Colleges /></PageWrapper>} />
        <Route path="/colleges/:id"        element={<PageWrapper><CollegeDetail /></PageWrapper>} />
        <Route path="/compare"             element={<PageWrapper><CompareColleges /></PageWrapper>} />
        
        {/* Student Protected Routes */}
        <Route path="/student/dashboard"   element={<PageWrapper><ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute></PageWrapper>} />
        <Route path="/quiz"                element={<PageWrapper><ProtectedRoute role="student"><Quiz /></ProtectedRoute></PageWrapper>} />
        
        {/* College Management Protected Routes */}
        <Route path="/college/dashboard"   element={<PageWrapper><ProtectedRoute role="college"><CollegeDashboard /></ProtectedRoute></PageWrapper>} />
        
        {/* Super Admin Protected Routes */}
        <Route path="/admin/dashboard"     element={<PageWrapper><ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute></PageWrapper>} />
        
        {/* Auxiliary static pages */}
        <Route path="/about"               element={<PageWrapper><div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto text-slate-600"><h1 className="font-heading text-3xl font-bold text-slate-800 mb-4">About InfoHub</h1><p>InfoHub is an AI-powered College Discovery, Event Management, Scholarship, Internship, and Career Guidance ecosystem connecting students across India with premium educational resources.</p></div></PageWrapper>} />
        <Route path="/contact"             element={<PageWrapper><div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto text-slate-600"><h1 className="font-heading text-3xl font-bold text-slate-800 mb-4">Contact Us</h1><p>Email: contact@info-hub.in | Support: support@info-hub.in | Hotline: +91 44-2235-7004</p></div></PageWrapper>} />
        <Route path="/help"                element={<PageWrapper><div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto text-slate-600"><h1 className="font-heading text-3xl font-bold text-slate-800 mb-4">Help &amp; Support</h1><p>Please use our floating AI assistant chatbot in the bottom right corner of the page for real-time recommendations, career guides, or college cutoff enquiries.</p></div></PageWrapper>} />
        <Route path="*"                    element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    // Enforce light theme as the sole theme
    document.body.classList.add('light');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-slate-50 body-bg transition-colors duration-300">
          <Navbar />
          <AnimatedRoutes />
          <Chatbot />
          <LiveBulletins />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
