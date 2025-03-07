import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentDashboard from './components/DocumentDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Document Management System</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<DocumentDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 