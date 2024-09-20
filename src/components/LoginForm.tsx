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
  const [errorMessage, setErrorMessage] = useState(""); // State variable for error message

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/users/login", {
        email: email,
        password: password,
      });

      if (response.data.loggedIn) {
        // Set the access token in cookies
        document.cookie = `access_token=${response.data.access_token}; path=/; Secure; SameSite=Strict`;

        // Call the function to activate the user
        await activeUser(response.data.access_token);
        console.log("User active !")
        // Redirect to the dashboard
        router.push("/dashboard");
      } else {
        // Set error message if login fails
        setErrorMessage("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setErrorMessage("Login failed. Please try again later.");
    }
  };

  // Function to activate the user
  const activeUser = async (token) => {
    if (!token) throw new Error("No token found");

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.id;
    console.log(userId);

    try {
      await axios.post("http://localhost:8080/active",
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
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
            <CardTitle className="text-xl font-bold">Malagasy Science</CardTitle>
            <CardDescription className="text-sm">
              Please login to your account
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
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
            <Label htmlFor="password" className="text-foreground">Password</Label>
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
            <p className="text-red-600 text-sm">{errorMessage}</p> // Conditionally render error message
          )}
          <Button type="submit" className="w-full bg-primary text-white hover:bg-secondary">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
      <div className="mt-6 flex justify-between">
        <Button className="bg-google px-4 py-2 rounded-md text-gray-900 hover:bg-red-100 transition-colors duration-300">
          Continue with Google
        </Button>
        <Button className="bg-facebook px-4 py-2 rounded-md text-gray-900 hover:bg-blue-700 hover:text-white transition-colors duration-300">
          Continue with Facebook
        </Button>
      </div>
    </Card>
  );
}
