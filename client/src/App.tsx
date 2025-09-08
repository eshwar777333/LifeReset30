import { Switch, Route } from "wouter";
import { useEffect } from "react";
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
import WeeklyReview from "@/pages/WeeklyReview";
import FocusMode from "@/pages/FocusMode";
import { useThemeSchedule } from "@/hooks/useThemeSchedule";
import { notify, scheduleIn } from "@/lib/notify";
import { SoundProvider } from "@/hooks/useSound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/progress" component={Progress} />
    <Route path="/review" component={WeeklyReview} />
    <Route path="/focus" component={FocusMode} />
      <Route path="/skills" component={Skills} />
      <Route path="/vision" component={Vision} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [appState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());
  useThemeSchedule();
  // Gentle nudges: schedule quick demo reminders (resets on reload)
  useEffect(() => {
    let cancels: Array<() => void> = [];
    (async () => {
      // Immediately welcome once per mount
      notify('Welcome back', { body: 'Ready for a focus session?' });
      // After 2 hours
      const c1 = await scheduleIn(2 * 60 * 60 * 1000, 'Midday check‑in', { body: 'Take a breath. What is your next task?' });
      // At 8pm-ish (best effort)
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      const c2 = await scheduleIn(diff, 'Evening reflection', { body: 'Write a short reflection for today.' });
      cancels = [c1, c2].filter(Boolean) as any;
    })();
    return () => { cancels.forEach(fn => fn && fn()); };
  }, []);

  return (
    <SoundProvider>
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
    </SoundProvider>
  );
}

export default App;
