import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import UploadRag from './pages/UploadRag';
import ChatAi from './pages/ChatAi';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatAi />} />
          <Route path="upload" element={<UploadRag />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
