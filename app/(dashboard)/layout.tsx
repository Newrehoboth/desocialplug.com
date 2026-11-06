import AuthGuard from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Layout;
