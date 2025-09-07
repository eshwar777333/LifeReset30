export interface MotivationalQuote {
  text: string;
  author?: string;
}

export const motivationalQuotes: MotivationalQuote[] = [
  { text: "DISCIPLINE = FREEDOM", author: "Jocko Willink" },
  { text: "1% BETTER EVERY DAY", author: "James Clear" },
  { text: "Progress, not perfection" },
  { text: "Your only limit is your mind" },
  { text: "Consistency beats perfection" },
  { text: "Success is a daily process" },
  { text: "Champions train, losers complain" },
  { text: "Excellence is a habit, not an act", author: "Aristotle" },
  { text: "Don't wait for opportunity, create it" },
  { text: "The pain of discipline weighs ounces, the pain of regret weighs tons" },
  { text: "You are what you repeatedly do" },
  { text: "Small steps daily lead to big dreams" },
  { text: "Comfort is the enemy of achievement" },
  { text: "Your dreams don't have an expiration date" },
  { text: "Be stronger than your strongest excuse" },
  { text: "Success starts with self-discipline" },
  { text: "Every master was once a beginner" },
  { text: "Focus on the process, trust the journey" },
  { text: "Momentum is built one day at a time" },
  { text: "Your future self is counting on you" },
  { text: "Transformation happens outside your comfort zone" },
  { text: "Discipline is choosing between what you want now and what you want most" },
  { text: "Winners focus on winning, losers focus on winners" },
  { text: "The grind never stops" },
  { text: "Hustle in silence, let success make the noise" },
  { text: "Champions are made when nobody is watching" },
  { text: "Level up every single day" },
  { text: "Your work ethic is your signature" },
  { text: "Success is earned, not given" },
  { text: "Be the energy you want to attract" },
];

export const getRandomQuote = (lastIndex?: number): { quote: MotivationalQuote; index: number } => {
  let index = Math.floor(Math.random() * motivationalQuotes.length);
  
  // Avoid repeating the same quote
  if (lastIndex !== undefined && index === lastIndex && motivationalQuotes.length > 1) {
    index = (index + 1) % motivationalQuotes.length;
  }
  
  return {
    quote: motivationalQuotes[index],
    index,
  };
};

export const getTodaysQuote = (day: number): MotivationalQuote => {
  // Use day to get a consistent quote for each day
  const index = (day - 1) % motivationalQuotes.length;
  return motivationalQuotes[index];
};
