import '../assets/styles/App.css';
import Header from '../component/Header';
import Footer from '../component/Footer';
import AppRoutes from '../routes/AppRoutes.jsx'
import AppLayout from '../component/AppLayout.jsx';
import { BrowserRouter as Router } from "react-router-dom";
import { ProductProvider } from '../context/ProductContext';

function App() {
  return (
    <ProductProvider>
      <Router>
        <AppLayout />
      </Router>
    </ProductProvider>
  );
}

export default App;