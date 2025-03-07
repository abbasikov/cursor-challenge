import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { updateDocument } from '../features/documents/documentsSlice';
import axios from 'axios';
import './UploadModal.css';

Modal.setAppElement('#root');

const UploadModal = ({ isOpen, onClose, documentId }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a PDF file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/upload/${documentId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            dispatch(updateDocument({
                id: documentId,
                fileName: response.data.fileName,
                uploadDate: response.data.uploadDate,
                pageCount: response.data.pageCount,
                extractions: response.data.extractions
            }));

            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="upload-modal"
            overlayClassName="upload-modal-overlay"
        >
            <h2>Upload PDF Document</h2>
            <div className="upload-form">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file-input"
                />
                {error && <p className="error-message">{error}</p>}
                <div className="modal-buttons">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="upload-button"
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadModal; 