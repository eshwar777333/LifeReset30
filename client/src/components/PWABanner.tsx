import React, { useState, useEffect } from 'react';

const PWABanner: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleClose = () => {
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #ccc',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <span>Add EventPilot to your home screen for a better experience.</span>
            <div>
                <button onClick={handleInstallClick} style={{ marginRight: 8 }}>
                    Install
                </button>
                <button onClick={handleClose}>Close</button>
            </div>
        </div>
    );
};

export default PWABanner;