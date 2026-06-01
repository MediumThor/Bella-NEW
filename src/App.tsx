import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

const OurProcess = lazy(() => import('./pages/OurProcess'));
const Inventory = lazy(() => import('./pages/Inventory'));
import QuoteInquiryWidget from './components/QuoteInquiryWidget';
import PageSeo from './components/PageSeo';
import './App.css';

// Lazy load less frequently used pages
const Sailing = lazy(() => import('./pages/Sailing'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Connect = lazy(() => import('./pages/Connect'));
const Blog = lazy(() => import('./pages/Blog'));
const Resources = lazy(() => import('./pages/Resources'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BlogPostEditor = lazy(() => import('./pages/BlogPostEditor'));
const CharterFormEditor = lazy(() => import('./pages/CharterFormEditor'));
const CharterGuestForm = lazy(() => import('./pages/CharterGuestForm'));
const JobChecklist = lazy(() => import('./pages/JobChecklist'));
const MeasurementPage = lazy(() => import('./pages/MeasurementPage'));
const AreasWeServe = lazy(() => import('./pages/AreasWeServe'));

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    color: '#EADAB6'
  }}>
    Loading...
  </div>
);

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
          <PageSeo />
          <ScrollToTop />
          <QuoteInquiryWidget />
          <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/our-process"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <main className="main-content"><OurProcess /></main>
                  </Suspense>
                }
              />
              <Route
                path="/inventory"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <main className="main-content"><Inventory /></main>
                  </Suspense>
                }
              />
              <Route
                path="/areas-we-serve"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <main className="main-content"><AreasWeServe /></main>
                  </Suspense>
                }
              />
              <Route 
                path="/sailing" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <main className="main-content"><Sailing /></main>
                    <Footer />
                  </Suspense>
                } 
              />
              <Route 
                path="/leadership" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Navigation />
                    <main className="main-content"><Leadership /></main>
                    <Footer />
                  </Suspense>
                } 
              />
              <Route 
                path="/connect" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Navigation />
                    <main className="main-content"><Connect /></main>
                    <Footer />
                  </Suspense>
                } 
              />
              <Route 
                path="/blog" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Navigation />
                    <main className="main-content"><Blog /></main>
                    <Footer />
                  </Suspense>
                } 
              />
              <Route 
                path="/resources" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Navigation />
                    <main className="main-content"><Resources /></main>
                    <Footer />
                  </Suspense>
                } 
              />
              <Route 
                path="/admin/login" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLogin />
                  </Suspense>
                } 
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/new-post"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <BlogPostEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-post/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <BlogPostEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/charter-form/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <CharterFormEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/charter-form/new"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <CharterFormEditor />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/charter-form/:id" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CharterGuestForm />
                  </Suspense>
                } 
              />
              <Route 
                path="/job-checklist" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <main className="main-content"><JobChecklist /></main>
                  </Suspense>
                } 
              /> 
              <Route 
                path="/measurement" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <main className="main-content"><MeasurementPage /></main>
                  </Suspense>
                } 
              />
            </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
