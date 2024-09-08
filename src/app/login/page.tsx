// src/app/login/page.tsx
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("assets/images/sci-bg.jpg")', opacity: 15}} />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      <div className="relative w-full z-20">
        <LoginForm />
      </div>
    </main>
  );
}
