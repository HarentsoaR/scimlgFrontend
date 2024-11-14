"use client";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import Link from "next/link";
import router, { useRouter } from "next/navigation";
import axios from "axios";
import { parseCookies } from "nookies";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/users/login", {
        email: email,
        password: password,
      });

      if (response.data.loggedIn) {
        document.cookie = `access_token=${response.data.access_token}; path=/; Secure; SameSite=Strict`;
        await activeUser(response.data.access_token);
        console.log("User active !");
        router.push("/dashboard");
      } else {
        setErrorMessage("Login failed. Please check your credentials."); // Static error message
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setErrorMessage("Login failed. Please check your credentials."); // Static error message
    }
  };

  const activeUser = async (token) => {
    if (!token) throw new Error("No token found");
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.id;
    console.log(userId);

    try {
      await axios.post("http://localhost:8080/active", { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Failed to add active user:", error);
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
            <CardTitle className="text-xl font-bold">Malagasy Science</CardTitle> {/* Static title */}
            <CardDescription className="text-sm">Please login to your account</CardDescription> {/* Static description */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label> {/* Static label */}
            <Input
              className="text-black"
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label> {/* Static label */}
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
            Login {/* Static button text */}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "} {/* Static signup prompt */}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up {/* Static signup link */}
          </Link>
        </p>
      </CardFooter>
      <div className="mt-6 flex justify-between">
        <Button className="bg-google px-4 py-2 rounded-md text-gray-900 hover:bg-red-100 transition-colors duration-300">
          Continue with Google {/* Static button text */}
        </Button>
        <Button className="bg-facebook px-4 py-2 rounded-md text-gray-900 hover:bg-blue-700 hover:text-white transition-colors duration-300">
          Continue with Facebook {/* Static button text */}
        </Button>
      </div>
    </Card>
  );
}
