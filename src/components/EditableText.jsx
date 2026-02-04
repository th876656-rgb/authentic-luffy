import React, { useState, useRef, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './EditableText.css';

const EditableText = ({
    value,
    onSave,
    tag = 'span',
    className = '',
    multiline = false,
    placeholder = 'Click to edit...'
}) => {
    const { isAdmin, editMode } = useProducts();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (!multiline) {
                inputRef.current.select();
            }
        }
    }, [isEditing, multiline]);

    const handleStartEdit = (e) => {
        if (isAdmin && editMode) {
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (editValue !== value) {
            await onSave(editValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!isAdmin || !editMode) {
        const Tag = tag;
        return <Tag className={className}>{value}</Tag>;
    }

    if (isEditing) {
        return (
            <div className="editable-text-container">
                {multiline ? (
                    <textarea
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`editable-text-input multiline ${className}`}
                        placeholder={placeholder}
                        rows={4}
                    />
                ) : (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`editable-text-input ${className}`}
                        placeholder={placeholder}
                    />
                )}
                <div className="editable-text-actions">
                    <button
                        className="btn-save-text"
                        onClick={handleSave}
                        title="Save (Enter)"
                    >
                        <Save size={14} />
                    </button>
                    <button
                        className="btn-cancel-text"
                        onClick={handleCancel}
                        title="Cancel (Esc)"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    const Tag = tag;
    return (
        <Tag
            className={`editable-text ${className}`}
            onClick={handleStartEdit}
            title="Click to edit"
        >
            {value || placeholder}
            <Edit className="edit-icon" size={14} />
        </Tag>
    );
};

export default EditableText;
