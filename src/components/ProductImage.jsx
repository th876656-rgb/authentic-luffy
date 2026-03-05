import React from 'react';
import useProductBackground from '../hooks/useProductBackground';

/**
 * Product card image that automatically applies the stored background for a product.
 * Uses localStorage to read the cached composite so it's instant on repeated renders.
 */
const ProductImage = ({ productId, src, alt, className = '', priority = false }) => {
    const displaySrc = useProductBackground(productId, src);

    return (
        <img
            src={displaySrc}
            alt={alt}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
    );
};

export default ProductImage;
