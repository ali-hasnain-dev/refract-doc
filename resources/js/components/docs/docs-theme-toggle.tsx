import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

const ICONS: Record<Appearance, typeof Sun> = {
    light: Sun,
    dark: Moon,
    system: Monitor,
};

const NEXT: Record<Appearance, Appearance> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
};

export default function DocsThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const Icon = ICONS[appearance];

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => updateAppearance(NEXT[appearance])}
            aria-label={`Switch theme (currently ${appearance})`}
            title={`Theme: ${appearance}`}
        >
            <span key={appearance} className="block animate-scale-in">
                <Icon className="size-4" />
            </span>
        </Button>
    );
}
