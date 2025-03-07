const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, `legal-${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Basic test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Helper function to get PDF page count
async function getPDFPageCount(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.numpages;
}

// Upload endpoint with PDF processing
app.post('/api/upload/:documentId', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get page count from uploaded PDF
        const pageCount = await getPDFPageCount(req.file.path);

        // Generate extractions (one per page)
        const extractions = Array.from({ length: pageCount }, (_, index) => ({
            id: index + 1,
            name: `Extraction ${index + 1}`,
            page: index + 1,
            content: `Content from page ${index + 1}`
        }));

        res.json({
            message: 'File uploaded successfully',
            fileName: req.file.filename, // Using filename instead of originalname
            uploadDate: new Date().toISOString(),
            documentId: req.params.documentId,
            pageCount,
            extractions
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

// Get document info endpoint
app.get('/api/documents/:documentId/info', async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, 'uploads');
        const files = fs.readdirSync(uploadsDir);
        
        // Find the first PDF file that contains 'legal' in its name
        const pdfFile = files.find(filename => 
            filename.toLowerCase().includes('legal') && 
            filename.toLowerCase().endsWith('.pdf')
        );

        if (!pdfFile) {
            return res.status(404).json({ message: 'No legal document found' });
        }

        const filePath = path.join(uploadsDir, pdfFile);
        const pageCount = await getPDFPageCount(filePath);

        const extractions = Array.from({ length: pageCount }, (_, index) => ({
            id: index + 1,
            name: `Extraction ${index + 1}`,
            page: index + 1,
            content: `Content from page ${index + 1}`
        }));

        res.json({
            fileName: pdfFile,
            pageCount,
            extractions
        });
    } catch (error) {
        console.error('Info fetch error:', error);
        res.status(500).json({ message: 'Error fetching document info', error: error.message });
    }
});

// Serve PDF files
app.get('/api/documents/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.contentType('application/pdf');
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 