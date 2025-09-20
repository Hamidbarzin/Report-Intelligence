import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import DashboardPage from "@/pages/dashboard";
import ReportPage from "@/pages/report";
import AdminPage from "@/pages/admin";
import AnalysisPage from "@/pages/Analysis";
import NotFound from "@/pages/not-found";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Report Intelligence</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/analysis">
                <Button 
                  variant="ghost" 
                  className={location === "/analysis" ? "text-primary" : "text-muted-foreground hover:text-primary"}
                >
                  آرشیو تحلیل‌ها
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input 
                type="text" 
                placeholder="Search reports..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
                data-testid="input-header-search"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            </div>
            <Link href="/admin">
              <Button variant="secondary" data-testid="button-admin">
                Admin
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-4">
              <Input 
                type="text" 
                placeholder="Search reports..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-mobile-search"
              />
              <nav className="space-y-2">
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/report/:id" component={ReportPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Router />
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
