import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });

    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("/auth/login", formData);

      setUser(res.data.user);

      navigate("/");
    } catch (err) {
      const message = err.response?.data?.error || "Invalid email or password";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin} className="space-y-2">
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-none">
            <Button
              type="submit"
              className="w-full bg-black text-white"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Continue"}
            </Button>
            <div className="text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="hover:underline font-medium">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
