import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

/**
 * OptimizedImage - Component ảnh tối ưu hiệu suất
 * - Hiển thị skeleton loading đẹp khi đang load
 * - Fade in mượt khi ảnh tải xong
 * - Hỗ trợ lazy loading (chỉ tải khi xuất hiện trên màn hình)
 * - Fallback khi ảnh lỗi
 * - Tránh layout shift (CLS) bằng width/height placeholder
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    priority = false,  // true = load ngay (ảnh đầu tiên above-the-fold)
    style = {},
    onClick,
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    // Nếu ảnh đã cache sẵn trong browser, hiện ngay
    useEffect(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
            setLoaded(true);
        }
    }, [src]);

    const handleLoad = () => {
        setLoaded(true);
    };

    const handleError = () => {
        setError(true);
        setLoaded(true); // Ẩn skeleton dù ảnh lỗi
    };

    return (
        <div className={`opt-img-wrapper ${className}`} style={style} onClick={onClick}>
            {/* Skeleton placeholder - hiện khi đang load */}
            {!loaded && (
                <div className="opt-img-skeleton" />
            )}

            {/* Ảnh thật */}
            {!error ? (
                <img
                    ref={imgRef}
                    src={src || ''}
                    alt={alt}
                    width="400"
                    height="400"
                    loading={priority ? 'eager' : 'lazy'}
                    fetchpriority={priority ? 'high' : 'auto'}
                    decoding={priority ? 'sync' : 'async'}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`opt-img ${loaded ? 'opt-img--loaded' : 'opt-img--loading'}`}
                />
            ) : (
                // Fallback khi ảnh lỗi
                <div className="opt-img-fallback">
                    <span>🖼️</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
