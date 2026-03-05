import { useState, useEffect } from 'react';

/**
 * Edge flood-fill background removal — shared utility.
 * Removes only border-connected light pixels, keeps shoe interior intact.
 */
const removeBackgroundFloodFill = (data, width, height, threshold = 238) => {
    const visited = new Uint8Array(width * height);
    const queue = [];

    const isLight = (idx) => {
        const d = idx * 4;
        return data[d] >= threshold && data[d + 1] >= threshold && data[d + 2] >= threshold;
    };

    const enqueue = (x, y) => {
        const idx = y * width + x;
        if (!visited[idx] && isLight(idx)) {
            visited[idx] = 1;
            queue.push(idx);
        }
    };

    for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
    for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

    while (queue.length > 0) {
        const idx = queue.pop();
        data[idx * 4 + 3] = 0;
        const x = idx % width;
        const y = Math.floor(idx / width);
        if (x > 0) enqueue(x - 1, y);
        if (x < width - 1) enqueue(x + 1, y);
        if (y > 0) enqueue(x, y - 1);
        if (y < height - 1) enqueue(x, y + 1);
    }
};

export const createComposite = (shoeSrc, bgSrc) => {
    return new Promise((resolve) => {
        const shoeImg = new Image();
        shoeImg.crossOrigin = 'anonymous';

        shoeImg.onload = () => {
            const W = shoeImg.naturalWidth;
            const H = shoeImg.naturalHeight;

            const tmp = document.createElement('canvas');
            tmp.width = W; tmp.height = H;
            const tctx = tmp.getContext('2d');
            tctx.drawImage(shoeImg, 0, 0);

            let imageData;
            try {
                imageData = tctx.getImageData(0, 0, W, H);
            } catch (e) {
                resolve(null); // CORS blocked
                return;
            }

            removeBackgroundFloodFill(imageData.data, W, H);
            tctx.putImageData(imageData, 0, 0);

            const bgImg = new Image();
            bgImg.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = W; canvas.height = H;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bgImg, 0, 0, W, H);
                ctx.drawImage(tmp, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            bgImg.onerror = () => resolve(null);
            bgImg.src = bgSrc;
        };
        shoeImg.onerror = () => resolve(null);
        shoeImg.src = shoeSrc;
    });
};

/**
 * Hook: Returns the correct image src for a product, with background composited if one is saved.
 * Caches the result in localStorage to avoid re-computing on every render.
 */
const useProductBackground = (productId, imageSrc) => {
    const bgKey = `product_bg_${productId}`;
    const cacheKey = `product_composite_${productId}`;

    const [displaySrc, setDisplaySrc] = useState(() => {
        try {
            // Instantly return cached composite if available
            const cached = localStorage.getItem(cacheKey);
            return cached || imageSrc;
        } catch {
            return imageSrc;
        }
    });

    useEffect(() => {
        if (!productId || !imageSrc) return;

        let cancelled = false;
        const bg = (() => { try { return localStorage.getItem(bgKey); } catch { return null; } })();

        if (!bg) {
            // No background set — show original image
            setDisplaySrc(imageSrc);
            return;
        }

        // Check if we have a valid cached composite for this productId
        const cached = (() => { try { return localStorage.getItem(cacheKey); } catch { return null; } })();
        if (cached) {
            setDisplaySrc(cached);
            return;
        }

        // Need to compute composite
        createComposite(imageSrc, bg).then((result) => {
            if (cancelled) return;
            if (result) {
                try { localStorage.setItem(cacheKey, result); } catch { }
                setDisplaySrc(result);
            } else {
                setDisplaySrc(imageSrc);
            }
        });

        return () => { cancelled = true; };
    }, [productId, imageSrc, bgKey, cacheKey]);

    return displaySrc;
};

export default useProductBackground;
