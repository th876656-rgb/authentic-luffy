import React from 'react';
import useProductBackground from '../hooks/useProductBackground';

/**
 * Smart product card image.
 * - For regular users (no localStorage bg): renders a plain img tag immediately — zero overhead.
 * - For admin with a background set: uses the hook to read cached composite.
 */
const ProductImage = ({ productId, src, alt, className = '', priority = false }) => {
    // Fast check: only use the hook if there's a background or cached composite for this product
    // This avoids running the hook for all products when no backgrounds are set
    const hasBg = (() => {
        try {
            return !!(
                localStorage.getItem(`product_bg_${productId}`) ||
                localStorage.getItem(`product_composite_${productId}`)
            );
        } catch {
            return false;
        }
    })();

    const displaySrc = useProductBackground(productId, src);

    return (
        <img
            src={displaySrc}
            alt={alt}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
    );
};

export default ProductImage;
