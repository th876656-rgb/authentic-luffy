// Cloudinary image upload utility
// Uses unsigned upload preset - no secret key needed on frontend

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dokbny9ej';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload một ảnh (base64 hoặc File) lên Cloudinary
 * @param {string|File} imageSource - base64 string hoặc File object
 * @param {string} folder - thư mục lưu trên Cloudinary (tùy chọn)
 * @returns {Promise<string>} - Public URL của ảnh
 */
export async function uploadToCloudinary(imageSource, folder = 'authentic-luffy') {
    // Nếu đã là URL bình thường (không phải base64), giữ nguyên
    if (typeof imageSource === 'string' && !imageSource.startsWith('data:')) {
        return imageSource;
    }

    const formData = new FormData();
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
        // base64 string
        formData.append('file', imageSource);
    } else if (imageSource instanceof File) {
        // File object
        formData.append('file', imageSource);
    } else {
        throw new Error('Invalid image source: must be base64 string or File object');
    }

    const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Cloudinary upload failed: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url; // HTTPS URL
}

/**
 * Upload nhiều ảnh cùng lúc
 * @param {Array<string|File>} images - Mảng base64 hoặc File
 * @param {string} folder - thư mục lưu
 * @returns {Promise<string[]>} - Mảng public URLs
 */
export async function uploadMultipleToCloudinary(images, folder = 'authentic-luffy') {
    const results = await Promise.all(
        images.map(async (img) => {
            if (!img) return '';
            try {
                return await uploadToCloudinary(img, folder);
            } catch (err) {
                console.error('Failed to upload image to Cloudinary:', err);
                return img; // fallback: giữ nguyên nếu lỗi
            }
        })
    );
    return results;
}
