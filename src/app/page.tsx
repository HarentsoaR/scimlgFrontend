// src/app/page.tsx
"use client"; // This is necessary for client-side navigation

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login"); // Redirect to the login page
  }, [router]);

  return null; // Return null while redirecting
}
