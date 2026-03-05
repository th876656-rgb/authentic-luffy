import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

/**
 * OptimizedImage - Nhanh & tương thích mọi thiết bị
 * - Không dùng fetchpriority (unsupported Safari < iOS 17)
 * - Dùng loading="eager" cho ảnh đầu, "lazy" native cho ảnh xa
 * - Auto-retry 1 lần khi lỗi network
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    priority = false,
    style = {},
    onClick,
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const imgRef = useRef(null);
    const hasRetried = useRef(false);

    // Reset khi src thay đổi
    useEffect(() => {
        setLoaded(false);
        setError(false);
        hasRetried.current = false;
    }, [src]);

    // Nếu ảnh đã cache sẵn, show ngay
    useEffect(() => {
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
            setLoaded(true);
        }
    }, [src, retryKey]);

    const handleLoad = () => setLoaded(true);

    const handleError = () => {
        if (!hasRetried.current && src) {
            // Retry 1 lần sau 500ms
            hasRetried.current = true;
            setTimeout(() => setRetryKey(k => k + 1), 500);
        } else {
            setError(true);
            setLoaded(true);
        }
    };

    if (!src) {
        return (
            <div className={`opt-img-wrapper ${className}`} style={style} onClick={onClick}>
                <div className="opt-img-skeleton" />
            </div>
        );
    }

    return (
        <div className={`opt-img-wrapper ${className}`} style={style} onClick={onClick}>
            {!loaded && <div className="opt-img-skeleton" />}

            {!error ? (
                <img
                    key={retryKey}
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`opt-img ${loaded ? 'opt-img--loaded' : 'opt-img--loading'}`}
                />
            ) : (
                <div className="opt-img-fallback">
                    <span>🖼️</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
