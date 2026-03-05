import React from 'react';
import OptimizedImage from './OptimizedImage';
import useProductBackground from '../hooks/useProductBackground';

/**
 * Wrapper around OptimizedImage that applies background compositing if one is saved.
 * All styling, CSS classes, and skeleton loading come from OptimizedImage as before.
 */
const ProductImage = ({ productId, src, alt, className = '', priority = false }) => {
    const displaySrc = useProductBackground(productId, src);

    return (
        <OptimizedImage
            src={displaySrc}
            alt={alt}
            className={className}
            priority={priority}
        />
    );
};

export default ProductImage;
