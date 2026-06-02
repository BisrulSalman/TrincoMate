import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages — lazy loaded
const Home = lazy(() => import('./pages/public/Home'));
const Categories = lazy(() => import('./pages/public/Categories'));
const Hotels = lazy(() => import('./pages/public/Hotels'));
const ServiceDetails = lazy(() => import('./pages/public/ServiceDetails'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const SearchResults = lazy(() => import('./pages/public/SearchResults'));
// Guest reviews removed
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Dashboards — lazy loaded
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DiscoverTrincomalee = lazy(() => import('./pages/DiscoverTrincomalee'));
// Admin gallery management removed

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<DiscoverTrincomalee />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/hotels" element={<Hotels />} />
            <Route path="/category/:categoryName" element={<Hotels />} />
            <Route path="/service/:id" element={<ServiceDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* Reviews page removed */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/user/*" element={<UserDashboard />} />
            <Route path="/owner/*" element={<OwnerDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            {/* Admin gallery management removed */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
