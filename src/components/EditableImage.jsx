import React, { useState, useRef } from 'react';
import { Upload, Save, X, Image as ImageIcon } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { supabase } from '../utils/supabase';
import './EditableImage.css';

const EditableImage = ({
    src,
    alt = '',
    onSave,
    className = '',
    style = {},
}) => {
    const { isAdmin, editMode } = useProducts();
    const [isEditing, setIsEditing] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        if (isAdmin && editMode && !isEditing) {
            setIsEditing(true);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewSrc(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (previewSrc) {
            try {
                setIsUploading(true);
                await onSave(previewSrc);
            } catch (err) {
                console.error('Save failed:', err);
            } finally {
                setIsUploading(false);
            }
        }
        setIsEditing(false);
        setPreviewSrc(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPreviewSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const displaySrc = previewSrc || src;

    if (!isAdmin || !editMode) {
        return (
            <div className={`editable-image-wrapper ${className}`} style={{ position: 'relative', ...style }}>
                <img
                    src={displaySrc}
                    alt={alt}
                    className={`editable-image ${className}`}
                    style={{ position: 'relative', zIndex: 1 }}
                />
            </div>
        );
    }

    return (
        <div className={`editable-image-wrapper ${isEditing ? 'editing' : ''}`}>
            <img
                src={displaySrc}
                alt={alt}
                className={`editable-image ${className}`}
                style={{ position: 'relative', zIndex: 1 }}
                onClick={handleImageClick}
            />

            {!isEditing && (
                <div className="image-edit-overlay" onClick={handleImageClick}>
                    <ImageIcon size={32} />
                    <span>Click to change</span>
                </div>
            )}

            {isEditing && (
                <>
                    <label className="image-upload-zone">
                        <Upload size={32} />
                        <span>Choose new image</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <div className="image-edit-actions">
                        <button className="btn-save-image" onClick={handleSave} disabled={!previewSrc || isUploading}>
                            <Save size={16} /> {isUploading ? 'Đang lưu...' : 'Save'}
                        </button>
                        <button className="btn-cancel-image" onClick={handleCancel}>
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EditableImage;
