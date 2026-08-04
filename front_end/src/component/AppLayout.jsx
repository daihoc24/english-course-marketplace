import '../assets/styles/App.css';
import Header from '../component/Header';
import Footer from '../component/Footer';
import AppRoutes from '../routes/AppRoutes.jsx';
import { useLocation } from 'react-router-dom';
import { AdminShellProvider } from '../context/AdminShellContext';
import ScrollToTop from './ScrollToTop.jsx';

function AppLayout() {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth");
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <AdminShellProvider>
      <ScrollToTop />
      {!isAuthRoute && <Header />}
      <AppRoutes />
      {!isAuthRoute && !isAdminRoute && <Footer />}
    </AdminShellProvider>
  );
}
export default AppLayout;
