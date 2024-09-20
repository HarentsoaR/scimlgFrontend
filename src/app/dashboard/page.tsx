"use client"
import Dashboard from "../../components/Dashboard";
import {AuthProvider} from '@/context/AuthContext'

export default function LoginPage() {
  return (
    <AuthProvider>
    <main className="flex">
      <Dashboard />
    </main>
    </AuthProvider>
  );
}
