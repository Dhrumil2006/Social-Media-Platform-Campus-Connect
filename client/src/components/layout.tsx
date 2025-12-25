import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  BookOpen, 
  Calendar, 
  Home, 
  User, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "News Feed", href: "/", icon: Home },
    { name: "Study Resources", href: "/resources", icon: BookOpen },
    { name: "Campus Events", href: "/events", icon: Calendar },
    ...(user ? [{ name: "My Profile", href: `/profile/${user.id}`, icon: User }] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  if (isLoading) return null;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-8 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-xl text-primary-foreground group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CampusConnect
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80" 
            asChild
          >
            <a href="/api/login">Sign In</a>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-border/50 sticky top-0 h-screen bg-card/50 backdrop-blur-sm">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg">CampusConnect</span>
        </Link>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
