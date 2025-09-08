import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppState } from "@shared/schema";
import { loadAppState } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { cn, debounce } from "@/lib/utils";

type UISkillPath = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  progress: number;
  topics: any; // array or string (server returns array; legacy local may be array)
  userId?: string | null;
};

export default function Skills() {
  const [appState, setAppState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());
  const [learningNotes, setLearningNotes] = useState("");
  const [skillPaths, setSkillPaths] = useState<UISkillPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const activeSkill = skillPaths.find(skill => skill.isActive) || appState.skillPaths.find(skill => skill.isActive);
  
  // Load skill paths from database
  useEffect(() => {
    const loadSkillPaths = async () => {
      try {
        const response = await fetch('/api/skills');
        if (response.ok) {
          const dbSkillPaths = await response.json();
          setSkillPaths(dbSkillPaths);
          
          // Sync with localStorage if database has data
          if (dbSkillPaths.length > 0) {
            // Persist DB UUIDs to local storage so future posts use correct IDs
            setAppState(prev => ({
              ...prev,
              skillPaths: dbSkillPaths,
            }));
          }
        } else {
          // Use localStorage if database fails
          setSkillPaths(appState.skillPaths);
        }
      } catch (error) {
        console.error('Failed to load skill paths from database:', error);
        // Fallback to localStorage
        setSkillPaths(appState.skillPaths);
      }
    };

    loadSkillPaths();
  }, []);
  
  // Start with empty learning notes each day (do not prefill from DB/localStorage)
  useEffect(() => {
    if (!activeSkill) return;
    setLearningNotes("");
  }, [appState.progress.currentDay, activeSkill?.id]);

  const handleSkillPathChange = async (skillId: string) => {
    setIsLoading(true);
    
    try {
      // Update localStorage first
      setAppState(prev => ({
        ...prev,
        skillPaths: prev.skillPaths.map(skill => ({
          ...skill,
          isActive: skill.id === skillId,
        })),
      }));
      
      // Also update the local skillPaths state
      setSkillPaths(prev => prev.map(skill => ({
        ...skill,
        isActive: skill.id === skillId,
      })));
      
      const skillName = appState.skillPaths.find(s => s.id === skillId)?.name;
      toast({
        title: "Skill Path Changed! 🎯",
        description: `Switched to ${skillName}`,
      });
    } catch (error) {
      console.error('Failed to update skill path:', error);
      
      toast({
        title: "Error",
        description: "Failed to update skill path",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!activeSkill) return;
    
    setIsLoading(true);

    // Save to database first
    try {
      const res = await fetch('/api/learning-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: appState.progress.currentDay,
          skillPathId: activeSkill.id,
          content: learningNotes,
        }),
      });
      // Keep textarea value as-is on success
      if (!res.ok) {
        console.error('Failed to save learning notes to database, status:', res.status);
      }
    } catch (error) {
      console.error('Failed to save learning notes to database:', error);
    }

    // Always also save to localStorage for compatibility using the correct schema
    const newNote = {
      id: `${appState.progress.currentDay}-${activeSkill.id}-note`,
      date: new Date(),
      day: appState.progress.currentDay,
      skillPath: activeSkill.id,
      content: learningNotes,
    };

    setAppState(prev => ({
      ...prev,
      learningNotes: [
        ...prev.learningNotes.filter(note => 
          !(note.day === appState.progress.currentDay && note.skillPath === activeSkill.id)
        ),
        newNote,
      ],
    }));

    toast({
      title: "Notes Saved! 📝",
      description: "Your learning notes have been saved successfully.",
    });

    // Clear the textarea after saving
    setLearningNotes("");
    setIsLoading(false);
  };

  const handleSaveNotes = debounce(saveNotes, 600);

  const handleExportNotes = () => {
    const skillNotes = appState.learningNotes
      .filter(note => note.skillPath === activeSkill?.id)
      .sort((a, b) => a.day - b.day);

    if (skillNotes.length === 0) {
      toast({
        title: "No Notes to Export",
        description: "You don't have any learning notes for this skill yet.",
      });
      return;
    }

    const text = skillNotes
      .map(note => `Day ${note.day} - ${note.date.toDateString()}\n\n${note.content}\n\n---\n\n`)
      .join('');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSkill?.name.toLowerCase().replace(/\s+/g, '-')}-notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Notes Exported! 📤",
      description: "Your learning notes have been exported successfully.",
    });
  };

  const todaysLearningTasks = [
    {
      id: 'tutorial',
      title: `Watch: ${activeSkill?.name} Tutorial`,
      description: '15 minutes',
      completed: false,
    },
    {
      id: 'practice',
      title: `Build: Practice Project`,
      description: '20 minutes • Hands-on learning',
      completed: false,
    },
    {
      id: 'challenge',
      title: `Challenge: Advanced Exercise`,
      description: '30 minutes • Test your knowledge',
      completed: false,
    },
  ];

  const resources = [
    { title: '📹 Official Documentation', url: '#' },
    { title: '💻 Practice Exercises', url: '#' },
    { title: '📚 Best Practices Guide', url: '#' },
    { title: '🎯 Project Templates', url: '#' },
  ];

  return (
    <div className="pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 mb-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2">Skill Builder</h2>
          <p className="text-muted-foreground">Master new skills, one day at a time</p>
        </motion.div>

        {/* Skill Path Selection */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {(skillPaths.length > 0 ? skillPaths : appState.skillPaths).map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "hover-scale cursor-pointer transition-all duration-300",
                  skill.isActive 
                    ? "border-2 border-primary bg-primary/5" 
                    : "border border-border hover:border-primary/50"
                )}
                onClick={() => handleSkillPathChange(skill.id)}
                data-testid={`skill-path-${skill.id}`}
              >
                <CardContent className="pt-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    skill.isActive ? "bg-primary/20" : "bg-muted"
                  )}>
                    <i className={cn(
                      skill.icon,
                      "text-xl",
                      skill.isActive ? "text-primary" : "text-muted-foreground"
                    )}></i>
                  </div>
                  <h3 className="font-bold mb-2">{skill.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                  <div className={cn(
                    "text-sm font-medium",
                    skill.isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {skill.isActive ? "Currently Active" : "Select Path"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {activeSkill && (
          <>
            {/* Current Learning Track */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Today's {activeSkill.name} Challenge</h3>
                    <Badge className="bg-primary/20 text-primary border-primary/20">
                      Day {appState.progress.currentDay} of 30
                    </Badge>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Today's Tasks */}
                    <div>
                      <h4 className="font-semibold mb-4 text-primary">{activeSkill.name} Learning Path</h4>
                      
                      <div className="space-y-4 mb-6">
                        {todaysLearningTasks.map((task, index) => (
                          <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-primary rounded mt-0.5"
                              data-testid={`learning-task-${task.id}`}
                            />
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-muted-foreground">{task.description}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Resources:</h5>
                        <div className="space-y-2">
                          {resources.map((resource, index) => (
                            <a 
                              key={index}
                              href={resource.url} 
                              className="block text-sm text-primary hover:underline"
                              data-testid={`resource-link-${index}`}
                            >
                              {resource.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <h4 className="font-semibold mb-4">Learning Notes</h4>
                      <Textarea
                        value={learningNotes}
                        onChange={(e) => setLearningNotes(e.target.value)}
                        className="h-48 resize-none"
                        placeholder={`Take notes on what you learned about ${activeSkill.name} today...`}
                        data-testid="learning-notes-textarea"
                      />
                      
                      <div className="flex space-x-3 mt-4">
                        <Button 
                          onClick={handleSaveNotes}
                          className="flex-1"
                          data-testid="save-notes-button"
                        >
                          Save Notes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleExportNotes}
                          data-testid="export-notes-button"
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Learning Progress</h3>
                  
                  <div className="space-y-4">
                    {(() => {
                      let topics: any[] = [];
                      if (Array.isArray(activeSkill.topics)) topics = activeSkill.topics as any[];
                      else if (typeof activeSkill.topics === 'string') {
                        try { topics = JSON.parse(activeSkill.topics as any); } catch { topics = []; }
                      }
                      return topics;
                    })().map((topic: { name: string; progress: number }, index: number) => (
                      <motion.div 
                        key={topic.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{topic.name}</span>
                          <span className="text-muted-foreground" data-testid={`topic-progress-${index}`}>
                            {topic.progress}%
                          </span>
                        </div>
                        <Progress value={topic.progress} className="h-3" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
