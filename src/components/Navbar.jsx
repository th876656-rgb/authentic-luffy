import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Upload, Settings, Menu, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './Navbar.css';

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);
    const [showLogoUpload, setShowLogoUpload] = useState(false);
    const { searchProducts, isAdmin, editMode } = useProducts();
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        // Load logo from Supabase settings
        const loadLogo = async () => {
            try {
                // For now, use a default logo or load from Supabase settings table
                // You can implement Supabase Storage upload later
                // Prioritize static logo for consistency across all users
                const staticLogo = '/images/logo.jpg';
                setLogoUrl(staticLogo);

                // Optional: Check if user has a custom override (local only)
                // const storedLogo = localStorage.getItem('logoUrl');
                // if (storedLogo) setLogoUrl(storedLogo);
            } catch (error) {
                console.error('Failed to load logo:', error);
            }
        };
        loadLogo();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.trim().length > 0) {
                const results = await searchProducts(searchTerm);
                setSearchResults(results.slice(0, 5));
                setShowSuggestions(true);
            } else {
                setSearchResults([]);
                setShowSuggestions(false);
            }
        };

        const debounce = setTimeout(performSearch, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, searchProducts]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const url = reader.result;
                setLogoUrl(url);
                setShowLogoUpload(false);

                // Save to localStorage temporarily
                // TODO: Upload to Supabase Storage for production
                localStorage.setItem('logoUrl', url);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowSuggestions(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle desktop-hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo Section */}
                <Link to="/" className="navbar-logo">
                    <div
                        className="avatar-circle"
                        onMouseEnter={() => isAdmin && editMode && setShowLogoUpload(true)}
                        onMouseLeave={() => setShowLogoUpload(false)}
                        onClick={(e) => {
                            // Prevent navigation if clicking on upload overlay
                            if (isAdmin && editMode && showLogoUpload) {
                                e.preventDefault();
                            }
                        }}
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="logo-image" />
                        ) : (
                            <span className="avatar-text">AL</span>
                        )}
                        {isAdmin && editMode && showLogoUpload && (
                            <label
                                className="logo-upload-overlay"
                                onMouseEnter={() => setShowLogoUpload(true)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Upload size={20} />
                                <span>Upload Logo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>
                    <div className="brand-name">Authentic Luffy</div>
                </Link>

                {/* Primary Menu - Desktop */}
                <div className="navbar-menu desktop-only">
                    <div className="menu-top">
                        <Link to="/new-arrivals" className="nav-link text-accent font-bold">Săn Sale Authentic</Link>
                    </div>
                    <div className="menu-bottom">
                        <Link to="/category/daily" className="nav-link">Giày Đi Hàng Ngày</Link>
                        <span className="separator">|</span>
                        <Link to="/category/sports" className="nav-link">Giày Chơi Thể Thao</Link>
                    </div>
                </div>

                {/* Utility Section */}
                <div className="navbar-utilities">
                    <div className="search-bar" ref={searchRef}>
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                            />
                            <Search className="search-icon" size={18} />
                        </form>

                        {showSuggestions && searchResults.length > 0 && (
                            <div className="search-suggestions">
                                {searchResults.map((product) => (
                                    <div
                                        key={product.id}
                                        className="suggestion-item"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <img src={product.images[0]} alt={product.name} />
                                        <div className="suggestion-info">
                                            <div className="suggestion-name">{product.name}</div>
                                            <div className="suggestion-sku">SKU: {product.sku}</div>
                                            <div className="suggestion-price">
                                                {formatPrice(product.sale_price || product.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="view-all-results" onClick={handleSearch}>
                                    Xem tất cả kết quả →
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="store-info desktop-only">
                        <div className="hotline">0868.653.931</div>
                        <div className="address">125 Lâm Du, Long Biên</div>
                    </div>

                    {isAdmin ? (
                        <Link to="/admin" className="admin-dashboard-btn">
                            <Settings size={20} />
                            <span className="dashboard-text">Bảng Điều Khiển</span>
                        </Link>
                    ) : (
                        <Link to="/login" className="admin-btn">
                            <User size={20} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link to="/new-arrivals" className="mobile-nav-link text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                    Săn Sale Authentic
                </Link>
                <Link to="/category/daily" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Giày Đi Hàng Ngày
                </Link>
                <Link to="/category/sports" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Giày Chơi Thể Thao
                </Link>
                <div className="mobile-store-info">
                    <div>Hotline: 0868.653.931</div>
                    <div>ĐC: 125 Lâm Du, Long Biên</div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

