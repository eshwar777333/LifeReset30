import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AppState, VisionGoal } from "@shared/schema";
import { loadAppState } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function Vision() {
  const [appState, setAppState] = useLocalStorage<AppState>("life-reset-30-app-state", loadAppState());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVision, setNewVision] = useState({
    title: "",
    description: "",
    targetValue: "",
    currentValue: "",
    targetDate: "",
    category: "personal" as "financial" | "material" | "business" | "personal",
    progress: 0,
  });
  const { toast } = useToast();

  const handleAddVision = () => {
    if (!newVision.title || !newVision.targetValue || !newVision.targetDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const vision: VisionGoal = {
      id: `vision-${Date.now()}`,
      title: newVision.title,
      description: newVision.description,
      targetValue: newVision.targetValue,
      currentValue: newVision.currentValue,
      targetDate: new Date(newVision.targetDate),
      category: newVision.category,
      progress: newVision.progress,
    };

    setAppState(prev => ({
      ...prev,
      visionGoals: [...prev.visionGoals, vision],
    }));

    setNewVision({
      title: "",
      description: "",
      targetValue: "",
      currentValue: "",
      targetDate: "",
      category: "personal",
      progress: 0,
    });

    setIsDialogOpen(false);

    toast({
      title: "Vision Added! ✨",
      description: "Your new vision goal has been added to your board.",
    });
  };

  const handleProgressUpdate = (visionId: string, newProgress: number) => {
    setAppState(prev => ({
      ...prev,
      visionGoals: prev.visionGoals.map(vision =>
        vision.id === visionId ? { ...vision, progress: newProgress } : vision
      ),
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return 'fas fa-dollar-sign';
      case 'material': return 'fas fa-car';
      case 'business': return 'fas fa-rocket';
      case 'personal': return 'fas fa-heart';
      default: return 'fas fa-star';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'from-success to-primary';
      case 'material': return 'from-primary to-secondary';
      case 'business': return 'from-secondary to-primary';
      case 'personal': return 'from-primary to-success';
      default: return 'from-primary to-secondary';
    }
  };

  const motivationalQuotes = [
    {
      text: "Your dreams don't have an expiration date. Take a deep breath and try again.",
      author: "KT Witten"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "A goal is a dream with a deadline.",
      author: "Napoleon Hill"
    }
  ];

  const todaysQuote = motivationalQuotes[appState.progress.currentDay % motivationalQuotes.length];

  return (
    <div className="pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 mb-12">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2">Vision Board</h2>
          <p className="text-muted-foreground">Visualize your dreams, make them reality</p>
        </motion.div>

        {/* Add Vision Button */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover-scale" size="lg" data-testid="add-vision-button">
                <Plus className="mr-2 h-4 w-4" />
                Add New Vision
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Vision</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vision-title">Vision Title *</Label>
                  <Input
                    id="vision-title"
                    value={newVision.title}
                    onChange={(e) => setNewVision(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., BMW M3"
                    data-testid="vision-title-input"
                  />
                </div>
                <div>
                  <Label htmlFor="vision-description">Description</Label>
                  <Textarea
                    id="vision-description"
                    value={newVision.description}
                    onChange={(e) => setNewVision(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your vision..."
                    rows={3}
                    data-testid="vision-description-input"
                  />
                </div>
                <div>
                  <Label htmlFor="vision-category">Category</Label>
                  <Select value={newVision.category} onValueChange={(value: any) => setNewVision(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger data-testid="vision-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-value">Target *</Label>
                    <Input
                      id="target-value"
                      value={newVision.targetValue}
                      onChange={(e) => setNewVision(prev => ({ ...prev, targetValue: e.target.value }))}
                      placeholder="e.g., $85,000"
                      data-testid="vision-target-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current-value">Current</Label>
                    <Input
                      id="current-value"
                      value={newVision.currentValue}
                      onChange={(e) => setNewVision(prev => ({ ...prev, currentValue: e.target.value }))}
                      placeholder="e.g., $25,000"
                      data-testid="vision-current-input"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-date">Target Date *</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newVision.targetDate}
                    onChange={(e) => setNewVision(prev => ({ ...prev, targetDate: e.target.value }))}
                    data-testid="vision-date-input"
                  />
                </div>
                <Button onClick={handleAddVision} className="w-full" data-testid="create-vision-button">
                  Create Vision
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Vision Cards Grid */}
        {appState.visionGoals.length > 0 ? (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {appState.visionGoals.map((vision, index) => (
              <motion.div
                key={vision.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-scale cursor-pointer group">
                  {/* Vision Header */}
                  <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${getCategoryColor(vision.category)} flex items-center justify-center`}>
                    <div className="text-white text-center z-10">
                      <div className="text-3xl font-black mb-2">{vision.targetValue}</div>
                      <div className="text-lg">{vision.title}</div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <i className={`${getCategoryIcon(vision.category)} text-white/20 text-6xl`}></i>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm opacity-90">{vision.category}</p>
                    </div>
                  </div>
                  
                  {/* Vision Details */}
                  <CardContent className="p-4">
                    {vision.description && (
                      <p className="text-sm text-muted-foreground mb-3">{vision.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Target Date</div>
                        <div className="font-bold">{new Date(vision.targetDate).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-bold text-primary" data-testid={`vision-progress-${index}`}>
                          {vision.progress}%
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={vision.progress} className="mb-3" />
                    
                    {vision.currentValue && (
                      <div className="text-sm text-muted-foreground">
                        Current: <span className="font-medium">{vision.currentValue}</span>
                      </div>
                    )}
                    
                    <div className="flex mt-3 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleProgressUpdate(vision.id, Math.min(100, vision.progress + 5))}
                        data-testid={`update-progress-${index}`}
                      >
                        +5% Progress
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">No Visions Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first vision to get started on your journey</p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="first-vision-button">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vision
            </Button>
          </motion.div>
        )}

        {/* Motivational Quote */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-xl">
            <blockquote className="text-2xl md:text-3xl font-black text-white mb-4">
              "{todaysQuote.text}"
            </blockquote>
            <cite className="text-white/80">— {todaysQuote.author}</cite>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
