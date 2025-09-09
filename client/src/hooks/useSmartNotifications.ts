import { useEffect, useState } from 'react';

type NotificationOptions = {
    title: string;
    body?: string;
    icon?: string;
};

type UseSmartNotificationsReturn = {
    notify: (options: NotificationOptions) => void;
    permission: NotificationPermission;
};

export function useSmartNotifications(): UseSmartNotificationsReturn {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    useEffect(() => {
        if (typeof Notification !== 'undefined' && permission === 'default') {
            Notification.requestPermission().then(setPermission);
        }
    }, [permission]);

    const notify = (options: NotificationOptions) => {
        if (typeof Notification === 'undefined') return;
        if (permission === 'granted') {
            new Notification(options.title, {
                body: options.body,
                icon: options.icon,
            });
        }
    };

    return { notify, permission };
}