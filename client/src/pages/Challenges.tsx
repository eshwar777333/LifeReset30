import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTimer } from "@/hooks/useTimer";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AppState } from "@shared/schema";
import { loadAppState, generateDailyTasks } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";

export default function Challenges() {
  const [appState, setAppState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());
  const { play } = useSound();
  type FrontendDailyTask = {
    id: string;
    title: string;
    description: string;
    duration: number;
    category: "morning" | "skill" | "evening";
    completed: boolean;
    icon: string;
  };
  const [todaysTasks, setTodaysTasks] = useState<FrontendDailyTask[]>([]);
  const [journalEntry, setJournalEntry] = useState({
    wentWell: "",
    couldImprove: "",
    tomorrowPriority: "",
  });
  const [activeTimer, setActiveTimer] = useState<'meditation' | 'exercise' | null>(null);
  const { toast } = useToast();

  // Meditation timer (10 minutes)
  const meditationTimer = useTimer({
    initialTime: 600, // 10 minutes in seconds
    onComplete: () => {
  toast({
        title: "Meditation Complete! 🧘‍♀️",
        description: "Great job on completing your meditation session.",
      });
  play('task:complete');
      setActiveTimer(null);
    },
  });

  // Exercise timer (20 minutes)
  const exerciseTimer = useTimer({
    initialTime: 1200, // 20 minutes in seconds
    onComplete: () => {
  toast({
        title: "Workout Complete! 💪",
        description: "Amazing work on completing your exercise session.",
      });
  play('task:complete');
      setActiveTimer(null);
    },
  });

  // Load today's tasks
  useEffect(() => {
    const currentDay = appState.progress.currentDay;
    let tasks = appState.dailyTasks[currentDay.toString()] as any[] | undefined;
    
    if (!tasks) {
      tasks = generateDailyTasks(currentDay) as any[];
      setAppState(prev => ({
        ...prev,
        dailyTasks: {
          ...prev.dailyTasks,
          [currentDay.toString()]: tasks as any,
        },
      }));
    }
    
    setTodaysTasks(tasks as unknown as FrontendDailyTask[]);
  }, [appState.progress.currentDay]);

  // Load existing journal entry for today
  useEffect(() => {
    // Do not prefill from DB/local; start with empty inputs each day
    setJournalEntry({
      wentWell: "",
      couldImprove: "",
      tomorrowPriority: "",
    });
  }, [appState.progress.currentDay]);

  const insertYesterdaysEntry = () => {
    try {
      const local = localStorage.getItem('life-reset-30-app-state');
      if (!local) return;
      const parsed = JSON.parse(local);
      const yesterday = appState.progress.currentDay - 1;
      if (yesterday < 1) return;
      const entry = (parsed.journalEntries || []).find((e: any) => e.day === yesterday);
      if (entry) {
        setJournalEntry({
          wentWell: entry.wentWell || '',
          couldImprove: entry.couldImprove || '',
          tomorrowPriority: entry.tomorrowPriority || '',
        });
      }
    } catch {}
  };

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = todaysTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setTodaysTasks(updatedTasks);
    
    setAppState(prev => ({
      ...prev,
      dailyTasks: {
        ...prev.dailyTasks,
        [prev.progress.currentDay.toString()]: updatedTasks as any,
      },
    }));
  };

  const saveJournal = async () => {
    try {
      // Save to database first
      const existingEntry = appState.journalEntries.find(
        entry => entry.day === appState.progress.currentDay
      );

      if (existingEntry) {
        // Update existing entry in database (find by day since we don't have the database ID)
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day: appState.progress.currentDay,
            wentWell: journalEntry.wentWell,
            couldImprove: journalEntry.couldImprove,
            tomorrowPriority: journalEntry.tomorrowPriority,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save journal entry to database');
        }
      } else {
        // Create new entry in database
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day: appState.progress.currentDay,
            wentWell: journalEntry.wentWell,
            couldImprove: journalEntry.couldImprove,
            tomorrowPriority: journalEntry.tomorrowPriority,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save journal entry to database');
        }
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      // Continue with localStorage save even if database fails
      play('error');
    }

    // Always save to localStorage as backup
  const newEntry = {
      id: `${appState.progress.currentDay}-journal`,
      date: new Date(),
      day: appState.progress.currentDay,
      wentWell: journalEntry.wentWell,
      couldImprove: journalEntry.couldImprove,
      tomorrowPriority: journalEntry.tomorrowPriority,
    };

    setAppState(prev => ({
      ...prev,
      journalEntries: [
        ...prev.journalEntries.filter(entry => (entry as any).day !== appState.progress.currentDay),
        newEntry as any,
      ],
    }));

    toast({
      title: "Journal Saved! 📝",
      description: "Your reflection has been saved successfully.",
    });
  play('save');

    // Clear inputs after successful save
    setJournalEntry({
      wentWell: "",
      couldImprove: "",
      tomorrowPriority: "",
    });
  };

  const handleSaveJournal = debounce(saveJournal, 600);

  const startTimer = (type: 'meditation' | 'exercise') => {
    setActiveTimer(type);
    if (type === 'meditation') {
      meditationTimer.start();
    } else {
      exerciseTimer.start();
    }
  };

  const getActiveTimerData = () => {
    if (activeTimer === 'meditation') {
      return {
        timer: meditationTimer,
        title: "Meditation Timer",
        duration: 10,
        icon: "fas fa-om",
      };
    } else if (activeTimer === 'exercise') {
      return {
        timer: exerciseTimer,
        title: "Exercise Timer",
        duration: 20,
        icon: "fas fa-dumbbell",
      };
    }
    return null;
  };

  const activeTimerData = getActiveTimerData();

  return (
    <div className="pt-20 pb-24 md:pt-24 md:pb-8 scroll-smooth">
      <div className="container mx-auto px-4 lg:px-6 mb-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2">Today's Challenges</h2>
          <p className="text-muted-foreground">Small steps lead to big transformations</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Challenge Checklist */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-6">Daily Tasks</h3>
                
                <div className="space-y-4">
                  {todaysTasks.map((task, index) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-start gap-3 w-full min-w-0">
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          onChange={() => handleTaskToggle(task.id)}
                          className="w-4 h-4 text-primary rounded"
                          data-testid={`task-checkbox-${task.id}`}
                        />
                        <div className="min-w-0">
                          <div className={`font-medium break-words ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </div>
                          <div className="text-sm text-muted-foreground leading-snug break-words">{task.description}</div>
                        </div>
                      </div>
                      {task.completed ? (
                        <i className="fas fa-check-circle text-success text-xl sm:self-auto self-end" data-testid={`task-completed-${task.id}`}></i>
                      ) : (
                        (task.title.toLowerCase().includes('meditation') || task.title.toLowerCase().includes('exercise')) ? (
                          <Button
                            size="sm"
                            className="touch-target tap-highlight-none hover-scale w-full sm:w-auto"
                            onClick={() => {
                              if (task.title.toLowerCase().includes('meditation')) {
                                startTimer('meditation');
                              } else if (task.title.toLowerCase().includes('exercise')) {
                                startTimer('exercise');
                              }
                            }}
                            disabled={activeTimer !== null}
                            data-testid={`start-task-${task.id}`}
                          >
                            <i className="fas fa-play mr-1"></i>Start
                          </Button>
                        ) : null
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timer Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Active Timer */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-6 text-center">
                  {activeTimerData ? activeTimerData.title : 'Timer Ready'}
                </h3>
                
                <div className="flex justify-center mb-6">
                  {activeTimerData ? (
                    <ProgressRing 
                      progress={activeTimerData.timer.progress}
                      size={180}
                      className="animate-glow lg:w-[200px] lg:h-[200px]"
                    >
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold" data-testid="timer-display">
                          {activeTimerData.timer.formatTime()}
                        </div>
                        <div className="text-xs lg:text-sm text-muted-foreground">
                          {Math.ceil(activeTimerData.timer.timeRemaining / 60)} min left
                        </div>
                        <div className="text-xs text-primary font-medium mt-1">
                          {activeTimerData.title}
                        </div>
                      </div>
                    </ProgressRing>
                  ) : (
                    <div className="w-44 h-44 lg:w-48 lg:h-48 rounded-full border-8 border-muted flex items-center justify-center hover-scale cursor-pointer transition-all duration-300">
                      <div className="text-center text-muted-foreground">
                        <i className="fas fa-play text-3xl lg:text-4xl mb-2 block"></i>
                        <div className="text-sm lg:text-base font-medium">Start a Timer</div>
                      </div>
                    </div>
                  )}
                </div>

                {activeTimerData ? (
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Button 
                      size="lg"
                      className="touch-target tap-highlight-none hover-scale flex-1 sm:flex-none"
                      onClick={activeTimerData.timer.isPaused ? activeTimerData.timer.resume : activeTimerData.timer.pause}
                      data-testid="timer-pause-resume"
                    >
                      <i className={`fas fa-${activeTimerData.timer.isPaused ? 'play' : 'pause'} mr-2`}></i>
                      {activeTimerData.timer.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline" 
                      className="touch-target tap-highlight-none hover-scale flex-1 sm:flex-none"
                      onClick={() => {
                        activeTimerData.timer.stop();
                        setActiveTimer(null);
                      }}
                      data-testid="timer-stop"
                    >
                      <i className="fas fa-stop mr-2"></i> Stop
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Button 
                      size="lg" 
                      className="touch-target tap-highlight-none hover-scale flex-1 sm:flex-none"
                      onClick={() => startTimer('meditation')} 
                      data-testid="start-meditation-timer"
                    >
                      <i className="fas fa-om mr-2"></i> Meditation (10min)
                    </Button>
                    <Button 
                      size="lg" 
                      className="touch-target tap-highlight-none hover-scale flex-1 sm:flex-none"
                      onClick={() => startTimer('exercise')} 
                      data-testid="start-exercise-timer"
                    >
                      <i className="fas fa-dumbbell mr-2"></i> Exercise (20min)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Journal Input */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Evening Reflection</h3>
                <div className="flex justify-end mb-2">
                  <Button size="sm" variant="outline" onClick={insertYesterdaysEntry}>
                    <i className="fas fa-rotate mr-2"></i> Insert yesterday's entry
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="went-well" className="block text-sm font-medium mb-2">
                      What went well today?
                    </Label>
                    <Textarea
                      id="went-well"
                      value={journalEntry.wentWell}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, wentWell: e.target.value }))}
                      placeholder="Write your thoughts..."
                      rows={3}
                      data-testid="journal-went-well"
                    />
                  </div>
                  <div>
                    <Label htmlFor="could-improve" className="block text-sm font-medium mb-2">
                      What could I improve?
                    </Label>
                    <Textarea
                      id="could-improve"
                      value={journalEntry.couldImprove}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, couldImprove: e.target.value }))}
                      placeholder="Be honest with yourself..."
                      rows={3}
                      data-testid="journal-could-improve"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tomorrow-priority" className="block text-sm font-medium mb-2">
                      Tomorrow's priority?
                    </Label>
                    <Textarea
                      id="tomorrow-priority"
                      value={journalEntry.tomorrowPriority}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, tomorrowPriority: e.target.value }))}
                      placeholder="Focus on one key thing..."
                      rows={2}
                      data-testid="journal-tomorrow-priority"
                    />
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full mt-4 touch-target tap-highlight-none hover-scale" 
                  onClick={handleSaveJournal}
                  data-testid="save-reflection-button"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save Reflection
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
