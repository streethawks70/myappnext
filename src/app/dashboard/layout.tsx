// app/dashboard/layout.tsx
import { Suspense } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Caricamento dashboard...</div>}>
      {children}
    </Suspense>
  );
}
