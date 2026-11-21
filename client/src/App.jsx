import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';

// Public Landing & Auth Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// 6 Core Dashboard Layouts (Admin+Director and Survey+Installation Combined)
import AdminDashboard from './pages/dashboards/AdminDashboard'; // Combined Admin + Director
import TechnicianDashboard from './pages/dashboards/TechnicianDashboard'; // Combined Survey Tech + Installation Tech
import SalesDashboard from './pages/dashboards/SalesDashboard';
import WarehouseDashboard from './pages/dashboards/WarehouseDashboard';
import ServiceSupportDashboard from './pages/dashboards/ServiceSupportDashboard';
import CustomerPortal from './pages/dashboards/CustomerPortal';

// Dedicated Modules
import EnquiriesList from './pages/modules/EnquiriesList';
import SurveysList from './pages/modules/SurveysList';
import QuotationsList from './pages/modules/QuotationsList';
import OrdersList from './pages/modules/OrdersList';
import InventoryList from './pages/modules/InventoryList';
import DispatchList from './pages/modules/DispatchList';
import InstallationsList from './pages/modules/InstallationsList';
import WarrantiesList from './pages/modules/WarrantiesList';
import ServiceTicketsList from './pages/modules/ServiceTicketsList';
import PaymentsInvoicesList from './pages/modules/PaymentsInvoicesList';
import UsersManagement from './pages/modules/UsersManagement';

// Dynamic Role-Based Dashboard Resolver: Exactly 6 Dashboard Layouts
const DynamicDashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  switch (role) {
    case 'Admin':
    case 'Director':
      return <AdminDashboard />;
    case 'Technician':
    case 'Field Technician':
    case 'Survey Technician':
    case 'Installation Technician':
      return <TechnicianDashboard />;
    case 'Sales':
      return <SalesDashboard />;
    case 'Warehouse':
      return <WarehouseDashboard />;
    case 'Service & Support':
      return <ServiceSupportDashboard />;
    case 'Customer':
      return <CustomerPortal />;
    default:
      return <AdminDashboard />;
  }
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Strict Role Guard to prevent unauthorized URL direct navigation (e.g. Customer visiting /users)
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  // Admin has superuser access to all modules
  if (user.role === 'Admin') {
    return children;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.error(`Access Denied: '${user.role}' is not authorized to access this module.`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '12px'
              }
            }}
          />
          <Routes>
            {/* Public Home Page with Role-Based Login */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Application Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Role-Customized Dashboard */}
              <Route path="/dashboard" element={<DynamicDashboard />} />

              {/* Module routes with strict RBAC guards */}
              <Route
                path="/users"
                element={
                  <RoleGuard allowedRoles={['Admin']}>
                    <UsersManagement />
                  </RoleGuard>
                }
              />
              <Route
                path="/director"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Director']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/inventory"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Warehouse']}>
                    <InventoryList />
                  </RoleGuard>
                }
              />
              <Route
                path="/dispatches"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Warehouse']}>
                    <DispatchList />
                  </RoleGuard>
                }
              />
              <Route
                path="/installations"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Director', 'Technician', 'Field Technician', 'Installation Technician', 'Survey Technician']}>
                    <InstallationsList />
                  </RoleGuard>
                }
              />
              <Route
                path="/surveys"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Director', 'Technician', 'Field Technician', 'Survey Technician', 'Installation Technician', 'Sales']}>
                    <SurveysList />
                  </RoleGuard>
                }
              />
              <Route
                path="/enquiries"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Sales', 'Technician', 'Field Technician', 'Survey Technician']}>
                    <EnquiriesList />
                  </RoleGuard>
                }
              />
              <Route
                path="/enquiries/new"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Customer', 'Sales']}>
                    <CustomerPortal />
                  </RoleGuard>
                }
              />
              <Route
                path="/quotations"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Sales', 'Customer']}>
                    <QuotationsList />
                  </RoleGuard>
                }
              />
              <Route
                path="/orders"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Director', 'Technician', 'Field Technician', 'Installation Technician', 'Survey Technician', 'Sales', 'Warehouse', 'Customer']}>
                    <OrdersList />
                  </RoleGuard>
                }
              />
              <Route
                path="/warranties"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Service & Support', 'Customer']}>
                    <WarrantiesList />
                  </RoleGuard>
                }
              />
              <Route
                path="/service-tickets"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Service & Support', 'Customer', 'Director']}>
                    <ServiceTicketsList />
                  </RoleGuard>
                }
              />
              <Route
                path="/service-tickets/new"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Customer', 'Service & Support']}>
                    <CustomerPortal />
                  </RoleGuard>
                }
              />
              <Route
                path="/payments"
                element={
                  <RoleGuard allowedRoles={['Admin', 'Director', 'Customer', 'Sales']}>
                    <PaymentsInvoicesList />
                  </RoleGuard>
                }
              />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
