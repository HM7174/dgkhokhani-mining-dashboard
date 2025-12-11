import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader } from 'lucide-react';
import api from '../services/api';

const FileUpload = ({
    onUploadSuccess,
    label = "Upload File",
    accept = "image/*",
    currentFileUrl = "",
    onDelete
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentFileUrl);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFiles(files[0]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files[0]);
        }
    };

    const handleFiles = async (file) => {
        // Validate file type
        if (accept === "image/*" && !file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        if (accept === "application/pdf" && file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const fileUrl = response.data.url;
            // If it's a relative URL from our backend, prepend base URL if needed
            // But usually we want to store the full URL or relative path.
            // Let's assume the backend returns a path like /uploads/filename.ext
            // We might need to prepend the API base URL if we are running on different ports
            // For now, let's assume relative path works if served from same origin or handled by proxy

            // Actually, since we are using vite proxy, /uploads should work if we proxy it
            // We need to add proxy for /uploads in vite.config.js if not already there

            setPreview(fileUrl);
            onUploadSuccess(fileUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setPreview('');
        if (onDelete) onDelete();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>

            {!preview ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                    `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={accept}
                        onChange={handleFileInput}
                    />

                    {uploading ? (
                        <Loader className="animate-spin text-blue-500 mb-2" size={24} />
                    ) : (
                        <Upload className="text-slate-400 mb-2" size={24} />
                    )}

                    <p className="text-sm text-slate-500 font-medium">
                        {uploading ? 'Uploading...' : 'Click or drag file to upload'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {accept === 'image/*' ? 'PNG, JPG, GIF up to 5MB' : 'PDF up to 5MB'}
                    </p>
                </div>
            ) : (
                <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {accept === 'image/*' ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="text-slate-500" size={24} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                            {preview.split('/').pop()}
                        </p>
                        <a
                            href={preview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                        >
                            View File
                        </a>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-red-500"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
