import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Search } from 'lucide-react';
import './SearchResults.css';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { searchProducts } = useProducts();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            const products = await searchProducts(query);
            setResults(products);
            setLoading(false);
        };

        if (query) {
            performSearch();
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query, searchProducts]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="search-results-page">
            <div className="container">
                <div className="search-header">
                    <Search size={32} />
                    <h1>Kết quả tìm kiếm cho "{query}"</h1>
                    <p>{results.length} sản phẩm được tìm thấy</p>
                </div>

                {loading ? (
                    <div className="loading">Đang tìm kiếm...</div>
                ) : results.length > 0 ? (
                    <div className="results-grid">
                        {results.map((product) => (
                            <div
                                key={product.id}
                                className={`result-card ${product.quantity === 0 ? 'sold-out' : ''}`}
                                onClick={() => handleProductClick(product.id)}
                            >
                                {product.sale_price && <span className="sale-badge">SALE</span>}
                                {product.quantity === 0 && (
                                    <div className="sold-overlay">
                                        <div className="sold-stamp">SOLD OUT</div>
                                    </div>
                                )}

                                <div className="result-image">
                                    <img src={product.images[0]} alt={product.name} />
                                </div>

                                <div className="result-info">
                                    <div className="result-sku">SKU: {product.sku}</div>
                                    <h3 className="result-name">{product.name}</h3>
                                    <div className="result-price">
                                        {product.sale_price ? (
                                            <>
                                                <span className="price-original">{formatPrice(product.price)}</span>
                                                <span className="price-sale">{formatPrice(product.sale_price)}</span>
                                            </>
                                        ) : (
                                            <span className="price-regular">{formatPrice(product.price)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <p>Không tìm thấy sản phẩm nào phù hợp với "{query}"</p>
                        <button onClick={() => navigate('/')}>Về Trang Chủ</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
