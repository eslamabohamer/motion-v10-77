
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import "./App.css";

// Pages
import IndexPage from '@/pages/Index';
import AboutPage from '@/pages/About';
import ServicesPage from '@/pages/Services';
import PortfolioPage from '@/pages/Portfolio';
import PortfolioDetailPage from '@/pages/PortfolioDetail';
import ContactPage from '@/pages/Contact';
import NotFoundPage from '@/pages/NotFound';
import RegisterPage from '@/pages/Register';

// Admin pages
import AdminLayout from '@/components/AdminLayout';
import AdminLoginPage from '@/pages/AdminLogin';
import AdminProjects from '@/pages/AdminProjects';
import AdminCategories from '@/pages/AdminCategories';
import AdminSettings from '@/pages/AdminSettings';
import AdminUsers from '@/pages/AdminUsers';
import AdminMessage from '@/pages/AdminMessage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProjects />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="messages" element={<AdminMessage />} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
