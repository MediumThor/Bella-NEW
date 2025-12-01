import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import OurProcess from './pages/OurProcess';
import Inventory from './pages/Inventory';
import Sailing from './pages/Sailing';
import Leadership from './pages/Leadership';
import Connect from './pages/Connect';
import Blog from './pages/Blog';
import Resources from './pages/Resources';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BlogPostEditor from './pages/BlogPostEditor';
import CharterFormEditor from './pages/CharterFormEditor';
import CharterGuestForm from './pages/CharterGuestForm';
import JobChecklist from './pages/JobChecklist';
import './App.css';

const ScrollToTop = () => {
  const location = useLocation();

  // Disable browser automatic scroll restoration so we control it
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Wait until after React paints the new route, then scroll to top
    const id = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(id);
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <ScrollToTop />
          <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
            <Route path="/our-process" element={<main className="main-content"><OurProcess /></main>} />
            <Route path="/inventory" element={<main className="main-content"><Inventory /></main>} />
            <Route path="/sailing" element={<><main className="main-content"><Sailing /></main><Footer /></>} />
            <Route path="/leadership" element={<><Navigation /><main className="main-content"><Leadership /></main><Footer /></>} />
            <Route path="/connect" element={<><Navigation /><main className="main-content"><Connect /></main><Footer /></>} />
            <Route path="/blog" element={<><Navigation /><main className="main-content"><Blog /></main><Footer /></>} />
            <Route path="/resources" element={<><Navigation /><main className="main-content"><Resources /></main><Footer /></>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/new-post"
                element={
                  <ProtectedRoute>
                    <BlogPostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-post/:id"
                element={
                  <ProtectedRoute>
                    <BlogPostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/charter-form/:id"
                element={
                  <ProtectedRoute>
                    <CharterFormEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/charter-form/new"
                element={
                  <ProtectedRoute>
                    <CharterFormEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="/charter-form/:id" element={<CharterGuestForm />} />
              <Route path="/job-checklist" element={<main className="main-content"><JobChecklist /></main>} />
            </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
