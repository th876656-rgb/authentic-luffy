import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './ProductCarousel.css';

const ProductCarousel = () => {
    const scrollRef = useRef(null);
    const { products } = useProducts();
    const navigate = useNavigate();

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <section className="product-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">SĂN DEAL HOT</h2>
                    <div className="carousel-controls">
                        <button onClick={() => scroll('left')} className="control-btn"><ChevronLeft /></button>
                        <button onClick={() => scroll('right')} className="control-btn"><ChevronRight /></button>
                    </div>
                </div>

                <div className="carousel-container" ref={scrollRef}>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="product-image-wrapper">
                                {product.sale_price && <span className="sale-badge">SALE</span>}
                                {product.quantity === 0 && (
                                    <div className="sold-overlay-mini">
                                        <span>SOLD</span>
                                    </div>
                                )}
                                <img src={product.images[0]} alt={product.name} className="product-image" />
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-price">
                                    {product.sale_price ? (
                                        <>
                                            <span className="price-original">{formatPrice(product.price)}</span>
                                            <span className="price-sale">{formatPrice(product.sale_price)}</span>
                                        </>
                                    ) : (
                                        <span className="price-regular">{formatPrice(product.price)}</span>
                                    )}
                                </div>
                                <button className="add-to-cart-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product.id);
                                }}>MUA NGAY</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;
