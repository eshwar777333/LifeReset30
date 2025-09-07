import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppState, DailyTask } from "@shared/schema";
import { loadAppState, saveAppState, generateDailyTasks, checkDailyReset } from "@/lib/storage";
import { getTodaysQuote } from "@/lib/motivationalQuotes";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [appState, setAppState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());
  const [todaysTasks, setTodaysTasks] = useState<DailyTask[]>([]);

  // Check for daily reset on component mount
  useEffect(() => {
    const resetState = checkDailyReset(appState);
    if (resetState !== appState) {
      setAppState(resetState);
    }
  }, []);

  // Load today's tasks
  useEffect(() => {
    const currentDay = appState.progress.currentDay;
    let tasks = appState.dailyTasks[currentDay.toString()];
    
    if (!tasks) {
      tasks = generateDailyTasks(currentDay);
      setAppState(prev => ({
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [currentDay.toString()]: tasks,
        },
      }));
    }
    
    setTodaysTasks(tasks);
  }, [appState.progress.currentDay]);

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = todaysTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setTodaysTasks(updatedTasks);
    
    // Update app state
    setAppState(prev => ({
      ...prev,
      dailyTasks: {
        ...prev.dailyTasks,
        [prev.progress.currentDay.toString()]: updatedTasks,
      },
    }));
  };

  const todaysQuote = getTodaysQuote(appState.progress.currentDay);
  const progressPercentage = (appState.progress.currentDay / 30) * 100;
  const remainingDays = 30 - appState.progress.currentDay;
  
  const morningTasks = todaysTasks.filter(task => task.category === 'morning');
  const skillTasks = todaysTasks.filter(task => task.category === 'skill');
  const eveningTasks = todaysTasks.filter(task => task.category === 'evening');

  const morningCompleted = morningTasks.filter(task => task.completed).length;
  const skillCompleted = skillTasks.filter(task => task.completed).length;
  const eveningCompleted = eveningTasks.filter(task => task.completed).length;

  return (
    <div className="pt-20 pb-24 md:pt-24 md:pb-8 scroll-smooth">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 mb-12 relative">
        {/* Daily Quote Header */}
        <motion.div 
          className="text-center mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="gradient-bg text-transparent bg-clip-text mb-4">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight">
              "{todaysQuote.text}"
            </h2>
          </div>
          <p className="text-base lg:text-lg text-muted-foreground px-4">
            Day <span className="text-primary font-bold" data-testid="current-day">{appState.progress.currentDay}</span> of 30 • You're crushing it! 💪
          </p>
        </motion.div>

        {/* Progress Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="mb-8 hover-scale">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Your Journey</h3>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary" data-testid="progress-percentage">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              
              <Progress value={progressPercentage} className="mb-4 h-4" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-success" data-testid="completed-days">
                    {appState.progress.currentDay - 1}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Done</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary" data-testid="streak-days">
                    {appState.progress.streak}
                  </div>
                  <div className="text-sm text-muted-foreground">Streak</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-secondary" data-testid="remaining-days">
                    {remainingDays}
                  </div>
                  <div className="text-sm text-muted-foreground">To Go</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Tasks */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Morning Routine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Morning Routine</h3>
                  <i className="fas fa-sun text-yellow-500 text-xl"></i>
                </div>
                <div className="space-y-3">
                  {morningTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 py-2 touch-target tap-highlight-none">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-6 h-6 text-primary rounded touch-target"
                        data-testid={`task-checkbox-${task.id}`}
                      />
                      <span className={cn(
                        "text-sm lg:text-base transition-all duration-300",
                        task.completed ? "line-through text-muted-foreground" : ""
                      )}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-success" data-testid="morning-progress">
                  {morningCompleted}/{morningTasks.length} Complete {morningCompleted === morningTasks.length ? '✅' : ''}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill Development */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Skill Building</h3>
                  <i className="fas fa-brain text-purple-500 text-xl"></i>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Today's Focus:</div>
                  <div className="font-semibold text-primary">
                    {appState.skillPaths.find(skill => skill.isActive)?.name || 'Select a skill path'}
                  </div>
                </div>
                <div className="space-y-3">
                  {skillTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-5 h-5 text-primary rounded"
                        data-testid={`task-checkbox-${task.id}`}
                      />
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/skills">
                  <Button className="mt-4 w-full touch-target hover-scale" size="lg" data-testid="start-learning-button">
                    <i className="fas fa-play mr-2"></i>
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evening Reflection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Evening Reflection</h3>
                  <i className="fas fa-moon text-blue-400 text-xl"></i>
                </div>
                <div className="space-y-3">
                  {eveningTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-5 h-5 text-primary rounded"
                        data-testid={`task-checkbox-${task.id}`}
                      />
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground" data-testid="evening-progress">
                  {eveningCompleted}/{eveningTasks.length} Complete
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/challenges">
            <Button className="h-20 lg:h-24 flex flex-col space-y-2 w-full hover-scale touch-target tap-highlight-none" size="lg" data-testid="start-timer-button">
              <i className="fas fa-play text-xl lg:text-2xl"></i>
              <span className="text-sm lg:text-base font-medium">Start Timer</span>
            </Button>
          </Link>
          <Link href="/challenges">
            <Button variant="outline" className="h-20 lg:h-24 flex flex-col space-y-2 w-full hover-scale touch-target tap-highlight-none" size="lg" data-testid="journal-button">
              <i className="fas fa-book text-xl lg:text-2xl"></i>
              <span className="text-sm lg:text-base font-medium">Journal</span>
            </Button>
          </Link>
          <Link href="/progress">
            <Button variant="outline" className="h-20 lg:h-24 flex flex-col space-y-2 w-full hover-scale touch-target tap-highlight-none" size="lg" data-testid="progress-button">
              <i className="fas fa-chart-line text-xl lg:text-2xl"></i>
              <span className="text-sm lg:text-base font-medium">Progress</span>
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            className="h-20 lg:h-24 flex flex-col space-y-2 w-full hover-scale bg-secondary hover:bg-secondary/90 touch-target tap-highlight-none" 
            size="lg"
            data-testid="emergency-button"
            onClick={() => {
              // TODO: Implement emergency mode
              alert("Emergency mode activated! Take 5 deep breaths and do 5 push-ups.");
            }}
          >
            <i className="fas fa-exclamation-triangle text-xl lg:text-2xl"></i>
            <span className="text-sm lg:text-base font-medium">SOS Mode</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
