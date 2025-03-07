import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './DocumentDetailsModal.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

Modal.setAppElement('#root');

const DocumentDetailsModal = ({ isOpen, onClose, document: pdfDocument }) => {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [extractions, setExtractions] = useState([]);
    const pdfContainerRef = React.useRef(null);

    useEffect(() => {
        const fetchDocumentInfo = async () => {
            if (pdfDocument?.id) {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}/documents/${pdfDocument.id}/info`
                    );
                    console.log(response.data);
                    setExtractions(response.data.extractions);
                } catch (error) {
                    console.error('Error fetching document info:', error);
                }
            }
        };

        if (pdfDocument) {
            fetchDocumentInfo();
        }
    }, [pdfDocument]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const goToPage = (pageNumber) => {
        const pageElement = window.document.getElementById(`page-${pageNumber}`);
        if (pageElement && pdfContainerRef.current) {
            pdfContainerRef.current.scrollTo({
                top: pageElement.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="document-modal"
            overlayClassName="document-modal-overlay"
        >
            <div className="document-modal-header">
                <h2>{pdfDocument?.fileName || 'Document Preview'}</h2>
                <button onClick={onClose} className="close-button">×</button>
            </div>
            
            <div className="document-modal-content">
                {/* Left Panel - PDF Preview */}
                <div className="pdf-panel">
                    <div className="pdf-container" ref={pdfContainerRef}>
                        {loading && <div className="loading">Loading PDF...</div>}
                        <Document
                            file={`${process.env.REACT_APP_API_URL}/documents/${pdfDocument?.fileName}`}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="loading">Loading PDF...</div>}
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <div 
                                    key={`page-${index + 1}`} 
                                    id={`page-${index + 1}`}
                                    className="pdf-page-container"
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        scale={1.2}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                </div>

                {/* Right Panel - Page Navigation */}
                <div className="extractions-panel">
                    <h3>Document Pages</h3>
                    <div className="extractions-list">
                        {extractions.map((extraction) => (
                            <div key={extraction.id} className="extraction-item">
                                <div className="extraction-info">
                                    <h4>Extraction {extraction.page} - Page {extraction.page}</h4>
                                </div>
                                <button 
                                    onClick={() => goToPage(extraction.page)}
                                    className="go-to-page-button"
                                >
                                    Go To Page
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DocumentDetailsModal; 