import React, { useState } from 'react';
import { FaFolder } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAllDocuments } from '../features/documents/documentsSlice';
import UploadModal from './UploadModal';
import DocumentDetailsModal from './DocumentDetailsModal';
import './DocumentDashboard.css';

const DocumentDashboard = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const documents = useSelector(selectAllDocuments);

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        if (document.fileName) {
            setIsDetailsModalOpen(true);
        } else {
            setIsUploadModalOpen(true);
        }
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setSelectedDocument(null);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedDocument(null);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <FaFolder className="dashboard-icon" />
            </div>
            <div className="documents-grid">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="document-box"
                        onClick={() => handleDocumentClick(doc)}
                    >
                        <h3>Legal Document {doc.id}</h3>
                        <div className="document-info">
                            <p>File Name: {doc.fileName || 'No file uploaded'}</p>
                            <p>Upload Date: {doc.uploadDate || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
                documentId={selectedDocument?.id}
            />
            <DocumentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                document={selectedDocument}
            />
        </div>
    );
};

export default DocumentDashboard; 