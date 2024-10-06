"use client"
import { NotificationProvider } from "@/context/NotificationContext";
import Notification from "../../components/Notification";
import { AuthProvider } from '@/context/AuthContext'

export default function PublicationPage() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <main className="flex">
          <Notification />
        </main>
      </NotificationProvider>
    </AuthProvider>
  );
}
