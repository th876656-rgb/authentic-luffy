import React, { useState, useRef } from 'react';
import { Upload, Save, X, Image as ImageIcon } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './EditableImage.css';

const EditableImage = ({
    src,
    alt = '',
    onSave,
    className = '',
    style = {},
    aspectRatio = 'auto'
}) => {
    const { isAdmin, editMode } = useProducts();
    const [isEditing, setIsEditing] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);
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
            reader.onloadend = () => {
                setPreviewSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (previewSrc) {
            await onSave(previewSrc);
        }
        setIsEditing(false);
        setPreviewSrc(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPreviewSrc(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displaySrc = previewSrc || src;

    if (!isAdmin || !editMode) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={style}
            />
        );
    }

    return (
        <div className={`editable-image-wrapper ${isEditing ? 'editing' : ''}`}>
            <img
                src={displaySrc}
                alt={alt}
                className={`editable-image ${className}`}
                style={style}
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
                        <button
                            className="btn-save-image"
                            onClick={handleSave}
                            disabled={!previewSrc}
                            title="Save image"
                        >
                            <Save size={16} /> Save
                        </button>
                        <button
                            className="btn-cancel-image"
                            onClick={handleCancel}
                            title="Cancel"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EditableImage;
