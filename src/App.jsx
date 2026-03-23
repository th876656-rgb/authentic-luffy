import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MessengerChatBubble from './components/MessengerChatBubble';
import ScrollToTop from './components/ScrollToTop';
import HoverPrefetch from './components/HoverPrefetch';
import Home from './pages/Home';
import './index.css';

// Lazy load heavy pages - only loaded when user navigates there
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));

function App() {
  return (
    <ProductProvider>
      <Router>
        <div className="app">
          <ScrollToTop />
          {/* Hover prefetch: preload routes before user clicks */}
          <HoverPrefetch />
          <Navbar />
          <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/new-arrivals" element={<CategoryPage />} />
              <Route path="/policy/return" element={<PolicyPage type="return" />} />
              <Route path="/policy/guide" element={<PolicyPage type="guide" />} />
              <Route path="/policy/privacy" element={<PolicyPage type="privacy" />} />
            </Routes>
          </Suspense>
          <Footer />
          {/* Messenger chat: non-critical, renders after main content */}
          <MessengerChatBubble />
        </div>
      </Router>
    </ProductProvider>
  );
}

export default App;
