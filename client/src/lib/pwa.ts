/**
 * PWA (Progressive Web App) utilities for registering service worker and handling install prompt.
 */

export function registerServiceWorker(swPath: string = '/service-worker.js') {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register(swPath)
                .then(registration => {
                    // Registration successful
                    // console.log('ServiceWorker registration successful:', registration);
                })
                .catch(error => {
                    // Registration failed
                    // console.error('ServiceWorker registration failed:', error);
                });
        });
    }
}

export function listenForInstallPrompt(
    callback: (event: BeforeInstallPromptEvent) => void
) {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
        event.preventDefault();
        callback(event as BeforeInstallPromptEvent);
    });
}

// Type for the install prompt event
export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}