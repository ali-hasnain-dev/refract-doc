import { config, createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import DocsLayout from '@/layouts/docs-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Inertia v3: cross-fade every navigation through the native browser View
// Transitions API. Inertia feature-detects `document.startViewTransition`
// itself, so this is a no-op (an instant, ordinary swap) in browsers that
// don't support it yet — nothing else needs to branch on support.
config.set('visitOptions', (_href, options) => ({
    ...options,
    viewTransition: true,
}));

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('docs/'):
                // A persistent layout: Inertia keeps DocsLayout mounted
                // across docs-to-docs navigations and only swaps the page
                // component nested inside it, so sidebar scroll position,
                // the search dialog, and the mobile nav sheet all survive.
                return DocsLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
