
import React from 'react';
import './Skeleton.css';

export const SkeletonProductCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-image"></div>
            <div className="skeleton-info">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
                <div className="skeleton skeleton-text price"></div>
            </div>
        </div>
    );
};

export const SkeletonProductDetail = () => {
    return (
        <div className="product-detail-page skeleton-detail-container">
            <div className="container">
                <div className="breadcrumb">
                    <div className="skeleton skeleton-text short" style={{ width: '200px' }}></div>
                </div>
                <div className="skeleton-detail-grid">
                    <div className="product-gallery">
                        <div className="skeleton skeleton-main-image"></div>
                        <div className="thumbnail-grid" style={{ marginTop: '12px' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '8px' }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="product-details">
                        <div className="skeleton skeleton-title"></div>
                        <div className="skeleton skeleton-text short"></div>
                        <div className="skeleton skeleton-text price"></div>
                        <div className="skeleton skeleton-desc"></div>
                        <div className="skeleton skeleton-text" style={{ height: '50px', width: '100%', marginTop: '24px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
