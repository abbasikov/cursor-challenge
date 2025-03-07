import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: Array(9).fill(null).map((_, index) => ({
    id: index + 1,
    fileName: '',
    uploadDate: '',
  })),
  status: 'idle',
  error: null,
};

export const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    updateDocument: (state, action) => {
      const { id, fileName, uploadDate } = action.payload;
      const document = state.documents.find(doc => doc.id === id);
      if (document) {
        document.fileName = fileName;
        document.uploadDate = uploadDate;
      }
    },
  },
});

export const { updateDocument } = documentsSlice.actions;

export const selectAllDocuments = (state) => state.documents.documents;

export default documentsSlice.reducer; 