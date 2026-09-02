import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { FactoryLayout } from '@/layouts/FactoryLayout';
import { SuperAdminLayout } from '@/layouts/SuperAdminLayout';

// Route Guards
import { PublicRoute, ProtectedRoute, FactoryRoute, SuperAdminRoute } from '@/routes/RouteGuards';

// Public & Auth Pages
import { HomePage } from '@/modules/public/HomePage';
import { LoginPage } from '@/modules/auth/LoginPage';
import { AdminLoginPage } from '@/modules/auth/AdminLoginPage';
import { RegisterPage } from '@/modules/auth/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from '@/modules/auth/ForgotPasswordPage';
import { OnboardingWizardPage } from '@/modules/auth/OnboardingWizardPage';

// Factory ERP Modules
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { ProductsPage } from '@/modules/products/ProductsPage';
import { RawMaterialsPage } from '@/modules/raw-materials/RawMaterialsPage';
import { ProductionPage } from '@/modules/production/ProductionPage';
import { StockPage } from '@/modules/stock/StockPage';
import { LabourPage } from '@/modules/labour/LabourPage';
import { CustomersPage } from '@/modules/customers/CustomersPage';
import { VendorsPage } from '@/modules/vendors/VendorsPage';
import { SalesPage } from '@/modules/sales/SalesPage';
import { InvoicesPage } from '@/modules/invoices/InvoicesPage';
import { ExpensesPage } from '@/modules/expenses/ExpensesPage';
import { PaymentsPage } from '@/modules/payments/PaymentsPage';
import { ReportsPage } from '@/modules/reports/ReportsPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';

// Super Admin Modules
import { AdminDashboardPage } from '@/modules/super-admin/AdminDashboardPage';
import { AdminFactoriesPage } from '@/modules/super-admin/AdminFactoriesPage';
import { AdminSubscriptionsPage } from '@/modules/super-admin/AdminSubscriptionsPage';
import { AdminPlansPage } from '@/modules/super-admin/AdminPlansPage';
import { AdminDemoPage } from '@/modules/super-admin/AdminDemoPage';
import { AdminUsersPage } from '@/modules/super-admin/AdminUsersPage';
import { AdminAuditLogsPage } from '@/modules/super-admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '@/modules/super-admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. PUBLIC MARKETING WEBSITE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* 2. AUTHENTICATION ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingWizardPage />} />

      {/* 3. FACTORY ERP PROTECTED ROUTES */}
      <Route
        element={
          <FactoryRoute>
            <FactoryLayout />
          </FactoryRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/raw-materials" element={<RawMaterialsPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/labour" element={<LabourPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 4. SUPER ADMIN CONTROL PLANE */}
      <Route
        element={
          <SuperAdminRoute>
            <SuperAdminLayout />
          </SuperAdminRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/factories" element={<AdminFactoriesPage />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="/admin/plans" element={<AdminPlansPage />} />
        <Route path="/admin/demo" element={<AdminDemoPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
