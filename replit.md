# Life Reset 30 - 30-Day Life Transformation Coach

## Overview

Life Reset 30 is a motivational web application designed to help users transform their lives over a 30-day period through daily challenges, skill building, progress tracking, and goal visualization. The app combines personal development coaching with gamification elements to maintain user engagement and motivation.

The application features a comprehensive dashboard system with daily task management, meditation and exercise timers, journaling capabilities, skill development paths, vision board creation, and progress tracking with milestone badges. It's built as a single-page application with client-side state management and responsive design for both desktop and mobile users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing without the overhead of React Router
- **State Management**: Local storage-based persistence using custom React hooks for application state
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **Animations**: Framer Motion for smooth transitions and engaging user interactions
- **Mobile-First Design**: Responsive layout with dedicated mobile navigation and desktop sidebar

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API endpoints and static file serving
- **Development Setup**: Vite for fast development builds and hot module replacement
- **Data Storage**: In-memory storage interface with plans for PostgreSQL database integration
- **API Design**: RESTful API structure with modular route organization

### Data Storage Solutions
- **Primary Storage**: Browser localStorage for user data persistence across sessions
- **Database Preparation**: Drizzle ORM configured for PostgreSQL with migration support
- **Session Management**: Express session handling with connect-pg-simple for database sessions
- **Schema Validation**: Zod schemas for runtime type checking and data validation

### Component Architecture
- **UI Components**: Comprehensive set of reusable components based on Radix UI primitives
- **Custom Components**: Specialized components like ProgressRing, timers, and mobile navigation
- **Page Structure**: Route-based page components for Dashboard, Challenges, Progress, Skills, and Vision
- **Hook System**: Custom hooks for localStorage management, timers, and mobile responsiveness

### State Management Strategy
- **App State Schema**: Centralized TypeScript interfaces for user progress, journal entries, skill paths, and vision goals
- **Persistence Layer**: Automatic localStorage synchronization with JSON serialization and date parsing
- **Daily Reset Logic**: Automatic progression tracking with streak calculations and day transitions
- **Progress Tracking**: Comprehensive metrics including completion rates, streak counters, and milestone badges

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM for component rendering and lifecycle management
- **TypeScript**: Full TypeScript support for type safety across client and server code
- **Vite**: Build tool and development server with hot module replacement

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system variables
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Framer Motion**: Animation library for page transitions and interactive elements
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icon set via CDN for expanded icon options

### Database and ORM
- **Drizzle ORM**: TypeScript-first ORM configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service integration
- **Database Migrations**: Drizzle Kit for schema migrations and database management

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### Utility Libraries
- **Zod**: Runtime schema validation and TypeScript type inference
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe utility for component variant management
- **clsx/tailwind-merge**: Conditional CSS class composition utilities

### Server Dependencies
- **Express.js**: Web application framework for API routes and static serving
- **Connect-pg-simple**: PostgreSQL session store for Express sessions
- **Wouter**: Client-side routing library for single-page application navigation