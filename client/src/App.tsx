import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Wallet from "@/pages/Wallet";
import Upload from "@/pages/Upload";
import History from "@/pages/History";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import AuthRegister from "@/pages/AuthRegister";
import FirebaseAuth from "@/pages/FirebaseAuth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={AuthRegister} />
      <Route path="/auth/firebase" component={FirebaseAuth} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/upload" component={Upload} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
