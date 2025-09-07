import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertDailyTaskSchema,
  insertJournalEntrySchema,
  insertSkillPathSchema,
  insertLearningNoteSchema,
  insertVisionGoalSchema,
} from "@shared/schema";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for image uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure demo user exists
  let demoUser = await storage.getUserByEmail('demo@lifereset30.com');
  if (!demoUser) {
    demoUser = await storage.createUser({
      email: 'demo@lifereset30.com',
      name: 'Demo User',
    });
  }
  
  const DEFAULT_USER_ID = demoUser.id;

  // User Progress Routes
  app.get('/api/progress', async (req, res) => {
    try {
      let progress = await storage.getUserProgress(DEFAULT_USER_ID);
      if (!progress) {
        // Create initial progress if it doesn't exist
        progress = await storage.updateUserProgress(DEFAULT_USER_ID, {
          currentDay: 1,
          streak: 0,
          completedDays: JSON.stringify([]),
          totalTasksCompleted: 0,
          startDate: new Date(),
          lastActiveDate: new Date(),
        });
      }
      
      // Parse JSON fields
      const formattedProgress = {
        ...progress,
        completedDays: JSON.parse(progress.completedDays || '[]'),
      };
      
      res.json(formattedProgress);
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  });

  app.put('/api/progress', async (req, res) => {
    try {
      const updates = req.body;
      
      // Stringify arrays if they exist
      if (updates.completedDays && Array.isArray(updates.completedDays)) {
        updates.completedDays = JSON.stringify(updates.completedDays);
      }
      
      const progress = await storage.updateUserProgress(DEFAULT_USER_ID, updates);
      
      // Parse JSON fields for response
      const formattedProgress = {
        ...progress,
        completedDays: JSON.parse(progress.completedDays || '[]'),
      };
      
      res.json(formattedProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  });

  // Daily Tasks Routes
  app.get('/api/tasks/:day', async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      const tasks = await storage.getDailyTasks(DEFAULT_USER_ID, day);
      res.json(tasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertDailyTaskSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const task = await storage.createDailyTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const task = await storage.updateDailyTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await storage.deleteDailyTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Journal Routes
  app.get('/api/journal/:day', async (req, res) => {
    try {
      const day = parseInt(req.params.day);
      const entry = await storage.getJournalEntry(DEFAULT_USER_ID, day);
      res.json(entry);
    } catch (error) {
      console.error('Error getting journal entry:', error);
      res.status(500).json({ error: 'Failed to get journal entry' });
    }
  });

  app.post('/api/journal', async (req, res) => {
    try {
      const entryData = insertJournalEntrySchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const entry = await storage.createJournalEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ error: 'Failed to create journal entry' });
    }
  });

  app.put('/api/journal/:id', async (req, res) => {
    try {
      const entry = await storage.updateJournalEntry(req.params.id, req.body);
      res.json(entry);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      res.status(500).json({ error: 'Failed to update journal entry' });
    }
  });

  // Skill Paths Routes
  app.get('/api/skills', async (req, res) => {
    try {
      const skillPaths = await storage.getSkillPaths(DEFAULT_USER_ID);
      
      // Parse JSON fields
      const formattedSkillPaths = skillPaths.map(skill => ({
        ...skill,
        topics: JSON.parse(skill.topics || '[]'),
      }));
      
      res.json(formattedSkillPaths);
    } catch (error) {
      console.error('Error getting skill paths:', error);
      res.status(500).json({ error: 'Failed to get skill paths' });
    }
  });

  app.post('/api/skills', async (req, res) => {
    try {
      const skillData = insertSkillPathSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
        topics: JSON.stringify(req.body.topics || []),
      });
      const skill = await storage.createSkillPath(skillData);
      
      // Parse JSON fields for response
      const formattedSkill = {
        ...skill,
        topics: JSON.parse(skill.topics || '[]'),
      };
      
      res.status(201).json(formattedSkill);
    } catch (error) {
      console.error('Error creating skill path:', error);
      res.status(500).json({ error: 'Failed to create skill path' });
    }
  });

  app.put('/api/skills/:id', async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.topics && Array.isArray(updates.topics)) {
        updates.topics = JSON.stringify(updates.topics);
      }
      
      const skill = await storage.updateSkillPath(req.params.id, updates);
      
      // Parse JSON fields for response
      const formattedSkill = {
        ...skill,
        topics: JSON.parse(skill.topics || '[]'),
      };
      
      res.json(formattedSkill);
    } catch (error) {
      console.error('Error updating skill path:', error);
      res.status(500).json({ error: 'Failed to update skill path' });
    }
  });

  app.delete('/api/skills/:id', async (req, res) => {
    try {
      await storage.deleteSkillPath(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting skill path:', error);
      res.status(500).json({ error: 'Failed to delete skill path' });
    }
  });

  // Learning Notes Routes
  app.get('/api/learning-notes', async (req, res) => {
    try {
      const day = req.query.day ? parseInt(req.query.day as string) : undefined;
      const notes = await storage.getLearningNotes(DEFAULT_USER_ID, day);
      res.json(notes);
    } catch (error) {
      console.error('Error getting learning notes:', error);
      res.status(500).json({ error: 'Failed to get learning notes' });
    }
  });

  app.post('/api/learning-notes', async (req, res) => {
    try {
      const noteData = insertLearningNoteSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const note = await storage.createLearningNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating learning note:', error);
      res.status(500).json({ error: 'Failed to create learning note' });
    }
  });

  // Vision Goals Routes
  app.get('/api/vision-goals', async (req, res) => {
    try {
      const goals = await storage.getVisionGoals(DEFAULT_USER_ID);
      res.json(goals);
    } catch (error) {
      console.error('Error getting vision goals:', error);
      res.status(500).json({ error: 'Failed to get vision goals' });
    }
  });

  app.post('/api/vision-goals', upload.single('image'), async (req, res) => {
    try {
      const goalData = {
        ...req.body,
        userId: DEFAULT_USER_ID,
        targetDate: new Date(req.body.targetDate),
        progress: parseFloat(req.body.progress || '0'),
      };
      
      // Add image URL if file was uploaded
      if (req.file) {
        goalData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const validatedData = insertVisionGoalSchema.parse(goalData);
      const goal = await storage.createVisionGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating vision goal:', error);
      res.status(500).json({ error: 'Failed to create vision goal' });
    }
  });

  app.put('/api/vision-goals/:id', upload.single('image'), async (req, res) => {
    try {
      const updates = { ...req.body };
      
      if (updates.targetDate) {
        updates.targetDate = new Date(updates.targetDate);
      }
      if (updates.progress) {
        updates.progress = parseFloat(updates.progress);
      }
      
      // Add image URL if file was uploaded
      if (req.file) {
        updates.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const goal = await storage.updateVisionGoal(req.params.id, updates);
      res.json(goal);
    } catch (error) {
      console.error('Error updating vision goal:', error);
      res.status(500).json({ error: 'Failed to update vision goal' });
    }
  });

  app.delete('/api/vision-goals/:id', async (req, res) => {
    try {
      await storage.deleteVisionGoal(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting vision goal:', error);
      res.status(500).json({ error: 'Failed to delete vision goal' });
    }
  });

  // Image upload route
  app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      res.json({ 
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));

  const httpServer = createServer(app);

  return httpServer;
}
