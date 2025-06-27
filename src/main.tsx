import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);
