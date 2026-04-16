import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductForm from './pages/ProductForm';
import PurchaseForm from './pages/PurchaseForm';
import StockOut from './pages/StockOut';
import Login from './pages/Login';
import AuthProvider, { useAuth } from './components/AuthProvider';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/new" element={<ProductForm />} />
            <Route path="purchases/new" element={<PurchaseForm />} />
            <Route path="stock/out" element={<StockOut />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
