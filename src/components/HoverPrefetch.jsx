import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HoverPrefetch - Instant.page logic
 * Khi user hover vào link nội bộ > 65ms → preload trang đích
 * Khi user click → trang đã sẵn trong RAM, hiện ra ngay lập tức
 */
const HoverPrefetch = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const prefetchedUrls = new Set();
        let hoverTimer = null;

        const prefetchRoute = (href) => {
            if (!href || prefetchedUrls.has(href)) return;
            // Chỉ prefetch internal routes
            if (!href.startsWith('/') && !href.startsWith(window.location.origin)) return;
            prefetchedUrls.add(href);

            // Tạo prefetch link trong <head> để browser load JS chunk trước
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            link.as = 'document';
            document.head.appendChild(link);
        };

        const handleMouseOver = (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

            // Delay 65ms để tránh prefetch khi user chỉ lướt qua nhanh
            hoverTimer = setTimeout(() => {
                prefetchRoute(href);
            }, 65);
        };

        const handleMouseOut = () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
        };

        // Thêm vào document để bắt tất cả links
        document.addEventListener('mouseover', handleMouseOver, { passive: true });
        document.addEventListener('mouseout', handleMouseOut, { passive: true });

        // Mobile: prefetch khi touchstart (user đang chạm vào)
        const handleTouchStart = (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('http')) return;
            prefetchRoute(href);
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('touchstart', handleTouchStart);
            if (hoverTimer) clearTimeout(hoverTimer);
        };
    }, []);

    return null; // Không render gì
};

export default HoverPrefetch;
