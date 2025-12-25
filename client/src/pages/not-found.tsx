import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full text-destructive">
            <AlertCircle className="h-12 w-12" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button asChild className="rounded-full px-8">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
