import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <AppRoutes />
          <ToastContainer />
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 
