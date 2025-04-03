window.global = window;

import './polyfills';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ApiTester from './ApiTester.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/api-test" element={<ApiTester />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
