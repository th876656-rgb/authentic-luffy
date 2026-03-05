import React, { useState, useRef, useEffect, useCallback } from 'react';
import './OptimizedImage.css';

/**
 * OptimizedImage - Component ảnh tương thích mọi thiết bị
 * - Skeleton loading khi đang tải
 * - Fade in mượt khi tải xong
 * - Lazy loading an toàn cho cả Safari iOS 14/15/16 (iPhone 11 trở xuống)
 * - Tự retry 1 lần nếu ảnh lỗi tạm thời (network timeout)
 * - Không dùng fetchpriority (unsupported trên Safari < iOS 17)
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
    const [retried, setRetried] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(priority); // priority ảnh → tải ngay
    const imgRef = useRef(null);
    const wrapperRef = useRef(null);

    // IntersectionObserver thủ công — tương thích Safari iOS 14+
    // Thay vì dùng loading="lazy" (có bug trên Safari cũ), ta tự quản lý
    useEffect(() => {
        if (priority) {
            setShouldLoad(true);
            return;
        }

        // Nếu trình duyệt không hỗ trợ IntersectionObserver → load luôn
        if (!('IntersectionObserver' in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '200px', // Bắt đầu tải trước 200px khi sắp xuất hiện
                threshold: 0,
            }
        );

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        return () => observer.disconnect();
    }, [priority]);

    // Nếu ảnh đã cache sẵn trong browser, hiện ngay
    useEffect(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
            setLoaded(true);
        }
    }, [src, shouldLoad]);

    // Reset state khi src thay đổi
    useEffect(() => {
        setLoaded(false);
        setError(false);
        setRetried(false);
    }, [src]);

    const handleLoad = useCallback(() => {
        setLoaded(true);
    }, []);

    const handleError = useCallback(() => {
        // Tự retry 1 lần sau 800ms — xử lý lỗi network tạm thời
        if (!retried && src) {
            setRetried(true);
            setTimeout(() => {
                if (imgRef.current) {
                    // Thêm cache-buster nhỏ để force reload
                    imgRef.current.src = src + (src.includes('?') ? '&' : '?') + '_r=1';
                }
            }, 800);
        } else {
            setError(true);
            setLoaded(true);
        }
    }, [retried, src]);

    return (
        <div ref={wrapperRef} className={`opt-img-wrapper ${className}`} style={style} onClick={onClick}>
            {/* Skeleton placeholder - hiện khi đang load */}
            {!loaded && (
                <div className="opt-img-skeleton" />
            )}

            {/* Ảnh thật - chỉ render src khi đã vào viewport */}
            {!error ? (
                <img
                    ref={imgRef}
                    src={shouldLoad ? (src || '') : ''}
                    alt={alt}
                    decoding="async"
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
