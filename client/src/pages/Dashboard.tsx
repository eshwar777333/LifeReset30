import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppState, DailyTask as DatabaseDailyTask } from "@shared/schema";
import { loadAppState, saveAppState, generateDailyTasks, checkDailyReset } from "@/lib/storage";
import { getTodaysQuote } from "@/lib/motivationalQuotes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import MilestoneModal from "@/components/MilestoneModal";
import { useSound } from "@/hooks/useSound";

// Legacy daily task type for frontend compatibility
type FrontendDailyTask = {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: "morning" | "skill" | "evening";
  completed: boolean;
  icon: string;
  priority: 'low' | 'high' | 'immediate';
};

// Type adapter function to convert database task to frontend task
function adaptDatabaseTaskToFrontend(dbTask: DatabaseDailyTask): FrontendDailyTask {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    duration: dbTask.duration,
    category: dbTask.category as "morning" | "skill" | "evening",
    completed: dbTask.completed ?? false,
    icon: dbTask.icon,
  priority: ((dbTask as any).priority as 'low' | 'high' | 'immediate') || 'low',
  };
}

// Essential daily tasks that should always be present
const getEssentialDailyTasks = (day: number): FrontendDailyTask[] => [
  // Morning Routine
  {
    id: crypto.randomUUID(),
    title: 'Wake Up at 6 AM',
    description: '5 minutes • Start your day early',
    duration: 5,
    category: 'morning',
    completed: false,
    icon: 'fas fa-sun',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Morning Exercise',
    description: '20 minutes • Build strength and energy',
    duration: 20,
    category: 'morning',
    completed: false,
    icon: 'fas fa-dumbbell',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Meditation Session',
    description: '10 minutes • Clear your mind',
    duration: 10,
    category: 'morning',
    completed: false,
    icon: 'fas fa-om',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Cold Shower',
    description: '5 minutes • Boost alertness',
    duration: 5,
    category: 'morning',
    completed: false,
    icon: 'fas fa-shower',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Morning Journal',
    description: '10 minutes • Gratitude and planning',
    duration: 10,
    category: 'morning',
    completed: false,
    icon: 'fas fa-book',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Morning Reading',
    description: '15 minutes • Read books for knowledge',
    duration: 15,
    category: 'morning',
    completed: false,
    icon: 'fas fa-book-open',
  priority: 'low',
  },
  
  // Afternoon/Study Time
  {
    id: crypto.randomUUID(),
    title: 'Study Session',
    description: '45 minutes • Focus on learning',
    duration: 45,
    category: 'skill',
    completed: false,
    icon: 'fas fa-graduation-cap',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Coding Practice',
    description: '60 minutes • Programming and development',
    duration: 60,
    category: 'skill',
    completed: false,
    icon: 'fas fa-code',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Deep Work Session',
    description: '90 minutes • Focused productivity',
    duration: 90,
    category: 'skill',
    completed: false,
    icon: 'fas fa-brain',
  priority: 'low',
  },
  
  // Evening Routine
  {
    id: crypto.randomUUID(),
    title: 'Evening Stretching',
    description: '15 minutes • Relax your muscles',
    duration: 15,
    category: 'evening',
    completed: false,
    icon: 'fas fa-child',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Evening Walk',
    description: '20 minutes • Get fresh air',
    duration: 20,
    category: 'evening',
    completed: false,
    icon: 'fas fa-walking',
  priority: 'low',
  },
  {
    id: crypto.randomUUID(),
    title: 'Podcast/Audiobook',
    description: '30 minutes • Learn while relaxing',
    duration: 30,
    category: 'evening',
    completed: false,
    icon: 'fas fa-podcast',
  priority: 'low',
  },
];

export default function Dashboard() {
  const { play } = useSound();
  const [appState, setAppState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());
  const [todaysTasks, setTodaysTasks] = useState<FrontendDailyTask[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    duration: 15,
    category: "morning" as "morning" | "skill" | "evening",
    icon: "fas fa-star",
  priority: 'low' as 'low' | 'high' | 'immediate',
  });
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'high' | 'immediate'>('all');
  const { toast } = useToast();
  const [milestoneDay, setMilestoneDay] = useState<number | null>(null);

  // Check for daily reset on component mount
  useEffect(() => {
    const resetState = checkDailyReset(appState);
    if (resetState !== appState) {
      setAppState(resetState);
    }
  }, []);

  // Load today's tasks
  useEffect(() => {
    const loadTodaysTasks = async () => {
      const currentDay = appState.progress.currentDay;
      
      try {
        // Try to fetch tasks from API first
        const response = await fetch(`/api/tasks/${currentDay}`);
        if (response.ok) {
          const apiTasks: DatabaseDailyTask[] = await response.json();
          
          // Check if we have the essential daily tasks
          const essentialTasks = getEssentialDailyTasks(currentDay);
          const missingTasks = essentialTasks.filter(essential => 
            !apiTasks.some(api => api.title === essential.title && api.day === currentDay)
          );
          
          // Create missing essential tasks
          for (const task of missingTasks) {
            try {
              const createResponse = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: task.title,
                  description: task.description,
                  duration: task.duration,
                  category: task.category,
                  completed: task.completed,
                  icon: task.icon,
                  priority: task.priority || 'low',
                  day: currentDay,
                }),
              });
              
              if (createResponse.ok) {
                const createdTask = await createResponse.json();
                apiTasks.push(createdTask);
              }
            } catch (error) {
              console.error('Failed to create essential task:', task.title, error);
            }
          }
          
          const adaptedTasks = apiTasks.map(adaptDatabaseTaskToFrontend);
          setTodaysTasks(adaptedTasks);
          return;
        }
      } catch (error) {
        console.error('Failed to load tasks from API:', error);
      }
      
      // Fallback: create essential tasks if API fails
      const essentialTasks = getEssentialDailyTasks(currentDay);
      setTodaysTasks(essentialTasks);
      
      // Try to create them in the database for next time
  for (const task of essentialTasks) {
        try {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              duration: task.duration,
              category: task.category,
              completed: task.completed,
              icon: task.icon,
      priority: task.priority || 'low',
              day: currentDay,
            }),
          });
        } catch (error) {
          console.error('Failed to create task in database:', error);
        }
      }
    };
    
    loadTodaysTasks();
  }, [appState.progress.currentDay]);

  const handleTaskToggle = async (taskId: string) => {
    const task = todaysTasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    
    try {
      // Update in API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });

      if (response.ok) {
        // Update local state
        const updatedTasks = todaysTasks.map(t => 
          t.id === taskId ? updatedTask : t
        );
        setTodaysTasks(updatedTasks);
        if (updatedTask.completed) play('task:complete');
        
        // Update app state for localStorage backup
        setAppState(prev => ({
          ...prev,
          dailyTasks: {
            ...prev.dailyTasks,
            [prev.progress.currentDay.toString()]: updatedTasks,
          },
        }));

        toast({
          title: updatedTask.completed ? "Task Completed! 🎉" : "Task Unchecked",
          description: updatedTask.completed ? "Great progress!" : "Keep going!",
        });

        // If all tasks are completed, mark day complete and advance
        const allDone = updatedTasks.length > 0 && updatedTasks.every(t => !!t.completed);
        if (allDone) {
          // Ask server to complete the day (idempotent)
          try {
            const resp = await fetch('/api/progress/complete-day', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ verify: true }),
            });
            if (resp.ok) {
              const serverProgress = await resp.json();
              setAppState(prev => ({
                ...prev,
                progress: {
                  ...prev.progress,
                  currentDay: serverProgress.currentDay,
                  streak: serverProgress.streak,
                  completedDays: serverProgress.completedDays,
                  lastActiveDate: new Date(serverProgress.lastActiveDate || new Date()),
                },
              }));
              const d = serverProgress.currentDay as number;
              if ([7, 30, 100].includes(d)) {
                setMilestoneDay(d);
              }
            }
          } catch (e) {
            console.warn('Failed to complete day on server', e);
          }
          play('day:complete');
          toast({
            title: "Day Completed ✅",
            description: "Awesome work! Advancing to the next day.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        duration: newTask.duration,
        category: newTask.category,
        icon: newTask.icon,
  priority: newTask.priority,
        day: appState.progress.currentDay,
        completed: false,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

    const createdTask = await response.json();

    // Update local state (adapt DB task to frontend shape)
    const adapted = adaptDatabaseTaskToFrontend(createdTask);
    setTodaysTasks(prev => [...prev, adapted]);
      
      // Update app state for localStorage backup
      setAppState(prev => ({
        ...prev,
        dailyTasks: {
      ...prev.dailyTasks,
      [prev.progress.currentDay.toString()]: [...todaysTasks, adapted],
        },
      }));

      // Reset form
      setNewTask({
        title: "",
        description: "",
        duration: 15,
        category: "morning",
        icon: "fas fa-star",
  priority: 'low',
      });

      setIsAddTaskDialogOpen(false);

      toast({
        title: "Task Added! ✨",
        description: "Your custom task has been added to today's challenges.",
      });

      // Ensure inputs are cleared if dialog remains open
      setNewTask({
        title: "",
        description: "",
        duration: 15,
        category: "morning",
        icon: "fas fa-star",
  priority: 'low',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        setTodaysTasks(prev => prev.filter(task => task.id !== taskId));
        
        // Update app state for localStorage backup
        setAppState(prev => ({
          ...prev,
          dailyTasks: {
            ...prev.dailyTasks,
            [prev.progress.currentDay.toString()]: todaysTasks.filter(task => task.id !== taskId),
          },
        }));

        toast({
          title: "Task Deleted",
          description: "The task has been removed from today's challenges.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isCustomTask = (taskId: string) => {
    // Custom tasks from API will have UUID format, generated tasks have pattern like "1-cold-shower"
    return !taskId.includes('-cold-shower') && 
           !taskId.includes('-meditation') && 
           !taskId.includes('-gratitude-journal') && 
           !taskId.includes('-skill-learning') && 
           !taskId.includes('-exercise') && 
           !taskId.includes('-evening-reflection');
  };

  const todaysQuote = getTodaysQuote(appState.progress.currentDay);
  const progressPercentage = (appState.progress.currentDay / 30) * 100;
  const remainingDays = 30 - appState.progress.currentDay;
  
  const priorityOrder: Record<'immediate' | 'high' | 'low', number> = { immediate: 0, high: 1, low: 2 };
  const sortByPriority = (a: FrontendDailyTask, b: FrontendDailyTask) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  };
  const morningAll = todaysTasks.filter(task => task.category === 'morning').slice().sort(sortByPriority);
  const skillAll = todaysTasks.filter(task => task.category === 'skill').slice().sort(sortByPriority);
  const eveningAll = todaysTasks.filter(task => task.category === 'evening').slice().sort(sortByPriority);

  const filterByPriority = (list: FrontendDailyTask[]) => {
    if (priorityFilter === 'all') return list;
    return list.filter(t => (t.priority || 'low') === priorityFilter);
  };

  const morningTasks = filterByPriority(morningAll);
  const skillTasks = filterByPriority(skillAll);
  const eveningTasks = filterByPriority(eveningAll);

  const morningCompleted = morningTasks.filter(task => task.completed).length;
  const skillCompleted = skillTasks.filter(task => task.completed).length;
  const eveningCompleted = eveningTasks.filter(task => task.completed).length;

  return (
    <div className="pt-24 pb-24 md:pt-24 md:pb-8 scroll-smooth overflow-x-hidden">
  <MilestoneModal open={milestoneDay !== null} day={milestoneDay || 0} onClose={() => setMilestoneDay(null)} />
      {/* Enhanced Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-success/8 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      </div>

  <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-10 max-w-6xl xl:max-w-7xl mb-12 relative">
        {/* Daily Quote Header */}
        <motion.div 
          className="text-center mb-8 lg:mb-12 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <div className="relative">
            <div className="absolute -inset-4 gradient-bg opacity-20 blur-2xl rounded-3xl animate-pulse-slow"></div>
            <div className="relative premium-card p-8 lg:p-12 rounded-3xl border border-white/10">
              <div className="gradient-text mb-6 px-2">
                <h2 className="hero-text break-words text-2xl sm:text-4xl lg:text-6xl xl:text-6xl leading-tight text-shadow text-center max-w-4xl mx-auto">
                  "{todaysQuote.text}"
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:space-x-4 text-sm sm:text-lg lg:text-xl">
                <div className="inline-flex items-baseline gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-muted-foreground whitespace-nowrap">Day</span>
                  <span className="gradient-text font-black text-xl sm:text-2xl leading-none" data-testid="current-day">{appState.progress.currentDay}</span>
                  <span className="text-muted-foreground whitespace-nowrap">of 30</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border"></div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">💪</span>
                  <span className="font-semibold text-primary">Crushing it!</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="mb-6 sm:mb-8 hover-scale">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Your Journey</h3>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary" data-testid="progress-percentage">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              
              <Progress value={progressPercentage} className="mb-4 h-3" />
              
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
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
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-2xl font-bold text-center sm:text-left">Today's Challenges</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
              <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by priority">
                <SelectValue placeholder="Priority: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="hover-scale touch-target tap-highlight-none w-full sm:w-auto justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[92vw] sm:w-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Read 10 pages"
                    data-testid="task-title-input"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add more details about your task..."
                    rows={3}
                    data-testid="task-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-duration">Duration (minutes)</Label>
                    <Input
                      id="task-duration"
                      type="number"
                      min="5"
                      max="180"
                      value={newTask.duration}
                      onChange={(e) => setNewTask(prev => ({ ...prev, duration: parseInt(e.target.value) || 15 }))}
                      data-testid="task-duration-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-category">Category</Label>
                    <Select value={newTask.category} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger data-testid="task-category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="skill">Skill</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger data-testid="task-priority-select">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-icon">Icon (Font Awesome class)</Label>
                  <Input
                    id="task-icon"
                    value={newTask.icon}
                    onChange={(e) => setNewTask(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g., fas fa-book"
                    data-testid="task-icon-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use Font Awesome classes like: fas fa-book, fas fa-music, fas fa-dumbbell
                  </p>
                </div>
                <Button 
                  onClick={handleAddCustomTask} 
                  size="lg"
                  className="w-full touch-target tap-highlight-none hover-scale" 
                  data-testid="create-task-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Morning Routine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-scale w-full overflow-hidden h-full lg:min-h-[420px]">
              <CardContent className="pt-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Morning Routine</h3>
                  <i className="fas fa-sun text-yellow-500 text-xl"></i>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {morningTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center space-x-3 py-2 touch-target tap-highlight-none rounded-md border-l-2 pl-3",
                        task.priority === 'immediate'
                          ? 'border-red-500/80 bg-red-500/5'
                          : task.priority === 'high'
                          ? 'border-amber-500/80 bg-amber-500/5'
                          : 'border-border'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-4 h-4 text-primary rounded"
                        data-testid={`task-checkbox-${task.id}`}
                      />
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "text-sm lg:text-base transition-all duration-300 truncate",
                          task.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {task.title}
                        </span>
                        {task.priority && (
                          <Badge variant="outline" className={cn(
                            "shrink-0",
                            task.priority === 'immediate' ? 'border-red-500 text-red-600' :
                            task.priority === 'high' ? 'border-amber-500 text-amber-600' :
                            'border-muted text-muted-foreground'
                          )}>
                            {task.priority === 'immediate' ? 'Immediate' : task.priority === 'high' ? 'High' : 'Low'}
                          </Badge>
                        )}
                      </div>
                      {isCustomTask(task.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          data-testid={`delete-task-${task.id}`}
                        >
                          ×
                        </Button>
                      )}
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
            <Card className="hover-scale w-full overflow-hidden h-full lg:min-h-[420px]">
              <CardContent className="pt-6 flex flex-col h-full">
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
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {skillTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center space-x-3 py-2 touch-target tap-highlight-none rounded-md border-l-2 pl-3",
                        task.priority === 'immediate'
                          ? 'border-red-500/80 bg-red-500/5'
                          : task.priority === 'high'
                          ? 'border-amber-500/80 bg-amber-500/5'
                          : 'border-border'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-4 h-4 text-primary rounded"
                        data-testid={`task-checkbox-${task.id}`}
                      />
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "text-sm lg:text-base transition-all duration-300 truncate",
                          task.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {task.description}
                        </span>
                        {task.priority && (
                          <Badge variant="outline" className={cn(
                            "shrink-0",
                            task.priority === 'immediate' ? 'border-red-500 text-red-600' :
                            task.priority === 'high' ? 'border-amber-500 text-amber-600' :
                            'border-muted text-muted-foreground'
                          )}>
                            {task.priority === 'immediate' ? 'Immediate' : task.priority === 'high' ? 'High' : 'Low'}
                          </Badge>
                        )}
                      </div>
                      {isCustomTask(task.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          data-testid={`delete-task-${task.id}`}
                        >
                          ×
                        </Button>
                      )}
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
            <Card className="hover-scale w-full overflow-hidden h-full lg:min-h-[420px]">
              <CardContent className="pt-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Evening Reflection</h3>
                  <i className="fas fa-moon text-blue-400 text-xl"></i>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {eveningTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center space-x-3 py-2 touch-target tap-highlight-none rounded-md border-l-2 pl-3",
                        task.priority === 'immediate'
                          ? 'border-red-500/80 bg-red-500/5'
                          : task.priority === 'high'
                          ? 'border-amber-500/80 bg-amber-500/5'
                          : 'border-border'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        className="w-4 h-4 text-primary rounded"
                        data-testid={`task-checkbox-${task.id}`}
                      />
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "text-sm lg:text-base transition-all duration-300 truncate",
                          task.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {task.title}
                        </span>
                        {task.priority && (
                          <Badge variant="outline" className={cn(
                            "shrink-0",
                            task.priority === 'immediate' ? 'border-red-500 text-red-600' :
                            task.priority === 'high' ? 'border-amber-500 text-amber-600' :
                            'border-muted text-muted-foreground'
                          )}>
                            {task.priority === 'immediate' ? 'Immediate' : task.priority === 'high' ? 'High' : 'Low'}
                          </Badge>
                        )}
                      </div>
                      {isCustomTask(task.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          data-testid={`delete-task-${task.id}`}
                        >
                          ×
                        </Button>
                      )}
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
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
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
