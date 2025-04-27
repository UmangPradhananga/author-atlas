import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Mail, User, Lock, Pen, BookText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [penName, setPenName] = useState("");
  const [genre, setGenre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create proper author signup request object
      const authorSignupRequest = {
        emailAddress: email,
        password: password,
        fullName: fullName,
        phoneNumber: "", // Could be added to form if needed
        address: "", // Could be added to form if needed
        categoryId: "", // Could be added to form if needed
        roleName: "Author",
        confirmPassword: confirmPassword,
        dateOfBirth: new Date(),
        // Author-specific fields
        penName: penName || fullName, // Use fullName as default if penName is empty
        genere: genre,
      };

      await signup(authorSignupRequest);

      toast({
        title: "Author account created successfully",
        description: "You can now sign in to your author account",
      });

      navigate("/login");
    } catch (error) {
      console.error("Author signup failed:", error);
      toast({
        title: "Signup failed",
        description: "There was an error creating your author account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 p-4 rounded-full bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Journal Manager</h1>
          <p className="text-muted-foreground mt-1">Create a new author account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Join our academic publishing platform as an author
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="penName" className="flex items-center gap-2">
                  <Pen className="h-4 w-4" />
                  Pen Name
                </Label>
                <Input
                  id="penName"
                  type="text"
                  placeholder="Your pen name (optional)"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="flex items-center gap-2">
                  <BookText className="h-4 w-4" />
                  Genre
                </Label>
                <Input
                  id="genre"
                  type="text"
                  placeholder="Your preferred genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => {
                    setAcceptTerms(checked as boolean);
                  }}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the <Link to="#" className="text-primary hover:underline">terms and conditions</Link>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
