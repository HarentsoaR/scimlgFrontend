"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

interface ValidationItemProps {
  isValid: boolean;
  text: string;
}

const ValidationItem: React.FC<ValidationItemProps> = ({ isValid, text }) => (
  <div className="flex items-center space-x-1">
    {isValid ? (
      <CheckCircle2 className="h-3 w-3 text-green-500" />
    ) : (
      <XCircle className="h-3 w-3 text-red-500" />
    )}
    <span className={`text-xs ${isValid ? "text-green-500" : "text-red-500"}`}>{text}</span>
  </div>
);

const PasswordStrengthIndicator: React.FC<{ strength: number }> = ({ strength }) => {
  const getColor = () => {
    if (strength < 2) return "bg-red-500";
    if (strength < 3) return "bg-yellow-500";
    if (strength < 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getLabel = () => {
    if (strength < 2) return "Weak";
    if (strength < 3) return "Fair";
    if (strength < 4) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-foreground">Password Strength</span>
        <span className={`text-xs font-medium ${getColor().replace('bg-', 'text-')}`}>{getLabel()}</span>
      </div>
      <Progress value={(strength / 4) * 100} className={`w-full h-1 ${getColor()}`} />
    </div>
  );
};

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    hasNumber: false,
    hasMinLength: false,
    hasSpecialChar: false,
    hasUppercase: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setPasswordValidation({
      hasNumber: /\d/.test(password),
      hasMinLength: password.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
    });
  }, [password]);

  const calculatePasswordStrength = () => {
    return Object.values(passwordValidation).filter(Boolean).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log("Signup attempted with:", { name, email, password, confirmPassword, role });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto bg-background/95 shadow-lg rounded-lg p-4">
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
              Join our platform for Malagasy scientists
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Dr. Rakoto Andrianjafy"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="role-select" className="text-xs font-medium">Select Your Role</Label>
                <select
                  id="role-select"
                  className="w-full h-8 text-sm border rounded bg-background"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Admin">Admin</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Evaluator">Evaluator</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-8 text-sm pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
                <PasswordStrengthIndicator strength={calculatePasswordStrength()} />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-xs font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-8 text-sm pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs space-y-1">
                  <ValidationItem isValid={passwordValidation.hasMinLength} text="At least 8 characters" />
                  <ValidationItem isValid={passwordValidation.hasNumber} text="Contains a number" />
                </div>
                <div className="text-xs space-y-1">
                  <ValidationItem isValid={passwordValidation.hasUppercase} text="Contains uppercase letter" />
                  <ValidationItem isValid={passwordValidation.hasSpecialChar} text="Contains special character" />
                </div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-secondary h-8 text-sm"
            disabled={!Object.values(passwordValidation).every(Boolean) || password !== confirmPassword}
          >
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center p-2">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}