export interface Achievement {
    id: string;
    title: string;
    description: string;
    achieved: boolean;
    dateAchieved?: Date;
}

export const achievements: Achievement[] = [
    {
        id: 'first-login',
        title: 'First Login',
        description: 'Logged in for the first time.',
        achieved: false,
    },
    {
        id: 'profile-complete',
        title: 'Profile Complete',
        description: 'Completed your user profile.',
        achieved: false,
    },
    // Add more achievements as needed
];

export function getAchievementById(id: string): Achievement | undefined {
    return achievements.find(a => a.id === id);
}

export function markAchievementAsAchieved(id: string, date: Date = new Date()): void {
    const achievement = getAchievementById(id);
    if (achievement && !achievement.achieved) {
        achievement.achieved = true;
        achievement.dateAchieved = date;
    }
}