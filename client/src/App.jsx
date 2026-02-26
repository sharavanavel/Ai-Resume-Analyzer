import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

function App() {
    return (
        <Router>
            {/* Animated background */}
            <div className="bg-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <div className="relative z-10 min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<UploadPage />} />
                        <Route path="/results/:reportId" element={<ResultsPage />} />
                        <Route path="/compare/:reportId" element={<ComparePage />} />
                        <Route path="/history" element={<HistoryPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
