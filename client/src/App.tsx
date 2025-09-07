import { Switch, Route } from "wouter";
import { motion } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppState } from "@shared/schema";
import { loadAppState } from "@/lib/storage";
import Dashboard from "@/pages/Dashboard";
import Challenges from "@/pages/Challenges";
import Progress from "@/pages/Progress";
import Skills from "@/pages/Skills";
import Vision from "@/pages/Vision";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/progress" component={Progress} />
      <Route path="/skills" component={Skills} />
      <Route path="/vision" component={Vision} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [appState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation streak={appState.progress.streak} />
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Router />
          </motion.main>
          <MobileNav />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
