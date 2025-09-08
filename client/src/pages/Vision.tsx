import { useState, useEffect } from "react";
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
import { getDefaultAppState } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { motivationalQuotes } from "@/lib/motivationalQuotes";

export default function Vision() {
  const [appState, setAppState] = useLocalStorage<AppState>("life-reset-30-app-state", getDefaultAppState());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVision, setNewVision] = useState({
    title: "",
    description: "",
    targetValue: "",
    currentValue: "",
    targetDate: "",
    category: "personal" as "financial" | "material" | "business" | "personal",
    progress: 0,
    imageFile: null as File | null,
  });
  const { toast } = useToast();
  const [hasLoadedFromAPI, setHasLoadedFromAPI] = useState(false);

  // Load vision goals from API on component mount - ONLY ONCE
  useEffect(() => {
    if (hasLoadedFromAPI) return; // Prevent multiple API calls

    const loadVisionGoals = async () => {
      try {
        const response = await fetch('/api/vision-goals');
        if (response.ok) {
          const visionGoals = await response.json();
          setAppState(prev => ({
            ...prev,
            visionGoals: visionGoals,
          }));
          setHasLoadedFromAPI(true); // Mark as loaded
        }
      } catch (error) {
        console.error('Failed to load vision goals:', error);
        setHasLoadedFromAPI(true); // Mark as attempted even if failed
      }
    };

    loadVisionGoals();
  }, [hasLoadedFromAPI]); // Only run when hasLoadedFromAPI changes

  const handleAddVision = async () => {
    if (!newVision.title || !newVision.targetValue || !newVision.targetDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newVision.title);
      formData.append('description', newVision.description);
      formData.append('targetValue', newVision.targetValue);
      formData.append('currentValue', newVision.currentValue);
      formData.append('targetDate', newVision.targetDate);
      formData.append('category', newVision.category);
      formData.append('progress', newVision.progress.toString());
      
      if (newVision.imageFile) {
        formData.append('image', newVision.imageFile);
      }

      const response = await fetch('/api/vision-goals', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create vision goal');
      }

      const createdVision = await response.json();

      // Update local state with the new vision from the server
      setAppState(prev => ({
        ...prev,
        visionGoals: [...prev.visionGoals, createdVision],
      }));

      setNewVision({
        title: "",
        description: "",
        targetValue: "",
        currentValue: "",
        targetDate: "",
        category: "personal",
        progress: 0,
        imageFile: null,
      });

  setIsDialogOpen(false);

      toast({
        title: "Vision Added! ✨",
        description: "Your new vision goal has been added to your board.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create vision goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProgressUpdate = async (visionId: string, newProgress: number) => {
    try {
      const response = await fetch(`/api/vision-goals/${visionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const updatedVision = await response.json();

      setAppState(prev => ({
        ...prev,
        visionGoals: prev.visionGoals.map(vision =>
          vision.id === visionId ? updatedVision : vision
        ),
      }));

      toast({
        title: "Progress Updated! 🎉",
        description: `Progress updated to ${newProgress}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
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

  // Pick 10 powerful quotes from the library (or first 10) and rotate every 5s
  const selectedQuotes = motivationalQuotes.slice(0, 10);
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % selectedQuotes.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);
  const todaysQuote = selectedQuotes[quoteIndex] || { text: "", author: "" };

  return (
    <div className="pt-20 pb-24 md:pt-24 md:pb-8 scroll-smooth">
      <div className="container mx-auto px-4 lg:px-6 mb-12">
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
              <Button className="hover-scale touch-target tap-highlight-none" size="lg" data-testid="add-vision-button">
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
                  <Label htmlFor="vision-image">Vision Image</Label>
                  <div className="relative">
                    <Input
                      id="vision-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewVision(prev => ({ ...prev, imageFile: file }));
                      }}
                      className="cursor-pointer file:cursor-pointer file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      data-testid="vision-image-input"
                    />
                  </div>
                  {newVision.imageFile && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-sm text-foreground">
                        📎 {newVision.imageFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(newVision.imageFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
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
                <Button 
                  onClick={handleAddVision} 
                  size="lg"
                  className="w-full touch-target tap-highlight-none hover-scale" 
                  data-testid="create-vision-button"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Vision
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Vision Cards Grid */}
        {appState.visionGoals.length > 0 ? (
          <motion.div 
            className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8"
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
                <Card className="overflow-hidden hover-scale cursor-pointer group touch-target tap-highlight-none">
                  {/* Vision Header */}
                  <div className={`relative h-48 overflow-hidden ${!vision.imageUrl ? `bg-gradient-to-br ${getCategoryColor(vision.category)}` : ''} flex items-center justify-center`}>
                    {vision.imageUrl ? (
                      <>
                        <img 
                          src={vision.imageUrl}
                          loading="lazy"
                          alt={vision.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                      </>
                    ) : null}
                    <div className="text-white text-center z-10">
                      <div className="text-3xl font-black mb-2 drop-shadow-lg">{vision.targetValue}</div>
                      <div className="text-lg drop-shadow-lg">{vision.title}</div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <i className={`${getCategoryIcon(vision.category)} text-white/30 text-6xl drop-shadow-lg`}></i>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm opacity-90 drop-shadow-lg">{vision.category}</p>
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
                        className="flex-1 touch-target tap-highlight-none hover-scale"
                        onClick={() => handleProgressUpdate(vision.id, Math.min(100, vision.progress + 5))}
                        data-testid={`update-progress-${index}`}
                      >
                        <i className="fas fa-plus mr-1"></i>
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
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              size="lg"
              className="touch-target tap-highlight-none hover-scale"
              data-testid="first-vision-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vision
            </Button>
          </motion.div>
        )}

        {/* Motivational Quotes (auto-rotating every 5s) */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-xl">
            <blockquote className="text-2xl md:text-3xl font-black text-white mb-2 transition-all duration-500">
              “{todaysQuote?.text}”
            </blockquote>
            {todaysQuote?.author && (
              <cite className="text-white/80">— {todaysQuote.author}</cite>
            )}
            <div className="mt-4 flex justify-center gap-1">
              {selectedQuotes.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === quoteIndex ? 'bg-white' : 'bg-white/40'}`}></span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
