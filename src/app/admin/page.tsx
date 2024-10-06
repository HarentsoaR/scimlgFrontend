"use client"
import Admin from "../../components/Admin";
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context//NotificationContext';

export default function AdminPage() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <main className="flex">
          <Admin />
        </main>
      </NotificationProvider>
    </AuthProvider>
  );
}
