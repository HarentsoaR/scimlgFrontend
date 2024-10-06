"use client"
import User from "../../components/User";
import { AuthProvider } from '@/context/AuthContext'

export default function PublicationPage() {
  return (
    <AuthProvider>
        <main className="flex">
          <User />
        </main>
    </AuthProvider>
  );
}
