"use client";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import Link from "next/link";
import router, { useRouter } from "next/navigation";
import axios from "axios";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function LoginForm() {
  const { t } = useTranslation(); // Use the translation hook
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/users/login", {
        email: email,
        password: password,
      });

      if (response.data.loggedIn) {
        document.cookie = `access_token=${response.data.access_token}; path=/; Secure; SameSite=Strict`;
        router.push("/dashboard");
      } else {
        setErrorMessage(t("login.errors.invalidCredentials")); // Use translation
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setErrorMessage(t("login.errors.generic")); // Use translation
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background shadow-lg rounded-lg p-4 md:p-6">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-center space-x-4">
          <img
            src="/assets/images/sci-logo.png"
            alt="Malagasy Science Logo"
            className="h-12 w-12"
          />
          <div>
            <CardTitle className="text-xl font-bold">{t("login.title")}</CardTitle> {/* Use translation */}
            <CardDescription className="text-sm">{t("login.description")}</CardDescription> {/* Use translation */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">{t("login.email")}</Label> {/* Use translation */}
            <Input
              className="text-black"
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")} // Use translation
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">{t("login.password")}</Label> {/* Use translation */}
            <Input
              className="text-black"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMessage && (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          )}
          <Button type="submit" className="w-full bg-primary text-white hover:bg-secondary">
            {t("login.submit")} {/* Use translation */}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="text-primary hover:underline">
            {t("login.signUp")} {/* Use translation */}
          </Link>
        </p>
      </CardFooter>
      <div className="mt-6 flex justify-between">
        <Button className="bg-google px-4 py-2 rounded-md text-gray-900 hover:bg-red-100 transition-colors duration-300">
          {t("login.google")} {/* Use translation */}
        </Button>
        <Button className="bg-facebook px-4 py-2 rounded-md text-gray-900 hover:bg-blue-700 hover:text-white transition-colors duration-300">
          {t("login.facebook")} {/* Use translation */}
        </Button>
      </div>
    </Card>
  );
}
