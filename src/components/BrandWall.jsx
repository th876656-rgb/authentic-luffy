import React from 'react';
import './BrandWall.css';

const brands = [
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Lacoste', 'Bape', 'Kobe'
];

const BrandWall = () => {
    return (
        <section className="brand-section">
            <div className="container">
                <h2 className="hidden-title">Brands</h2>
                <div className="brand-grid">
                    {brands.map((brand, index) => (
                        <div key={index} className="brand-item">
                            <span className="brand-text">{brand}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandWall;
