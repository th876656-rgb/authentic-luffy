import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MessengerChatBubble from './components/MessengerChatBubble';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import PolicyPage from './pages/PolicyPage';
import './index.css';

function App() {
  return (
    <ProductProvider>
      <Router>
        <div className="app">
          <Navbar />
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
          <Footer />
          <MessengerChatBubble />
        </div>
      </Router>
    </ProductProvider>
  );
}

export default App;
