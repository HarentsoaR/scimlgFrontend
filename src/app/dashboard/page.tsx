"use client"
import Dashboard from "../../components/Dashboard";
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context//NotificationContext';

export default function LoginPage() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <main className="flex">
          <Dashboard />
        </main>
      </NotificationProvider>
    </AuthProvider>
  );
}
