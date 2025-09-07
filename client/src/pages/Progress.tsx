import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppState } from "@shared/schema";
import { loadAppState } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function Progress() {
  const [appState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());

  const badges = [
    {
      id: "first-week",
      title: "First Week",
      description: "Unlocked Day 7",
      icon: "fas fa-trophy",
      requirement: 7,
      unlocked: appState.progress.currentDay >= 7,
    },
    {
      id: "two-weeks",
      title: "Two Weeks",
      description: "Unlocked Day 14",
      icon: "fas fa-fire",
      requirement: 14,
      unlocked: appState.progress.currentDay >= 14,
    },
    {
      id: "three-weeks",
      title: "Three Weeks",
      description: "Unlocked Day 21",
      icon: "fas fa-star",
      requirement: 21,
      unlocked: appState.progress.currentDay >= 21,
    },
    {
      id: "champion",
      title: "Champion",
      description: "Day 30 Goal",
      icon: "fas fa-crown",
      requirement: 30,
      unlocked: appState.progress.currentDay >= 30,
    },
  ];

  const completionRate = Math.round((appState.progress.currentDay / 30) * 100);

  return (
    <div className="pt-20 pb-24 md:pt-24 md:pb-8 scroll-smooth">
      <div className="container mx-auto px-4 lg:px-6 mb-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
          <p className="text-muted-foreground">Every day counts towards your transformation</p>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={cn(
                "text-center hover-scale cursor-pointer transition-all duration-300 touch-target tap-highlight-none",
                badge.unlocked 
                  ? "border-success/50 bg-success/5" 
                  : "opacity-50 border-border"
              )}>
                <CardContent className="pt-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
                    badge.unlocked ? "bg-success/20" : "bg-muted"
                  )}>
                    <i className={cn(
                      badge.icon,
                      "text-2xl",
                      badge.unlocked ? "text-success" : "text-muted-foreground"
                    )} data-testid={`badge-icon-${badge.id}`}></i>
                  </div>
                  <h3 className={cn(
                    "font-bold",
                    badge.unlocked ? "text-success" : "text-muted-foreground"
                  )}>
                    {badge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {badge.unlocked && (
                    <Badge variant="secondary" className="mt-2 bg-success text-success-foreground">
                      Unlocked!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* 30-Day Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-6">30-Day Journey</h3>
              
              <div className="grid grid-cols-7 gap-2 md:gap-3 mb-6">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isCompleted = day < appState.progress.currentDay;
                  const isToday = day === appState.progress.currentDay;
                  const isFuture = day > appState.progress.currentDay;
                  
                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 hover:scale-105",
                        {
                          "bg-success text-success-foreground": isCompleted,
                          "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background": isToday,
                          "bg-muted text-muted-foreground": isFuture,
                        }
                      )}
                      data-testid={`calendar-day-${day}`}
                    >
                      {day}
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-success rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <span>Upcoming</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="text-center hover-scale">
            <CardContent className="pt-6">
              <div className="text-3xl font-black text-primary mb-2" data-testid="current-streak">
                {appState.progress.streak}
              </div>
              <div className="font-medium">Current Streak</div>
              <div className="text-sm text-muted-foreground mt-1">🔥 Keep it going!</div>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale">
            <CardContent className="pt-6">
              <div className="text-3xl font-black text-success mb-2" data-testid="completion-rate">
                {completionRate}%
              </div>
              <div className="font-medium">Completion Rate</div>
              <div className="text-sm text-muted-foreground mt-1">
                📈 {completionRate >= 80 ? "Excellent progress" : completionRate >= 60 ? "Good progress" : "Keep pushing!"}
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale">
            <CardContent className="pt-6">
              <div className="text-3xl font-black text-secondary mb-2" data-testid="days-remaining">
                {30 - appState.progress.currentDay + 1}
              </div>
              <div className="font-medium">Days Remaining</div>
              <div className="text-sm text-muted-foreground mt-1">
                🎯 {30 - appState.progress.currentDay + 1 <= 5 ? "Almost there!" : "You've got this!"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
