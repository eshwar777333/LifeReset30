import React from 'react';

interface Achievement {
    id: number;
    title: string;
    description: string;
    date: string;
}

interface AchievementsDisplayProps {
    achievements: Achievement[];
}

const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({ achievements }) => {
    if (!achievements || achievements.length === 0) {
        return <div>No achievements to display.</div>;
    }

    return (
        <div>
            <h2>Achievements</h2>
            <ul>
                {achievements.map((achievement) => (
                    <li key={achievement.id} style={{ marginBottom: '1rem' }}>
                        <strong>{achievement.title}</strong>
                        <div>{achievement.description}</div>
                        <small>{achievement.date}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AchievementsDisplay;