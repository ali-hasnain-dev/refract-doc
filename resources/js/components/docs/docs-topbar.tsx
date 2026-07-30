import { Link } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import DocsThemeToggle from '@/components/docs/docs-theme-toggle';
import { Button } from '@/components/ui/button';
import type { DocsSite } from '@/types/docs';

export default function DocsTopbar({
    site,
    onOpenSearch,
    onOpenNav,
}: {
    site: DocsSite;
    onOpenSearch: () => void;
    onOpenNav: () => void;
}) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const scrollable =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;

            setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
            <div
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary transition-transform duration-150 ease-out"
                style={{ transform: `scaleX(${progress})` }}
            />
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 lg:px-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onOpenNav}
                    aria-label="Open navigation"
                >
                    <Menu className="size-4" />
                </Button>

                <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold"
                >
                    <AppLogoIcon className="size-6 fill-current text-primary" />
                    <span>{site.name}</span>
                </Link>

                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="ml-2 hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 sm:flex"
                >
                    <Search className="size-4" />
                    <span className="flex-1 text-left">
                        Search documentation...
                    </span>
                    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]">
                        ⌘K
                    </kbd>
                </button>

                <div className="ml-auto flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="sm:hidden"
                        onClick={onOpenSearch}
                        aria-label="Search documentation"
                    >
                        <Search className="size-4" />
                    </Button>
                    <DocsThemeToggle />
                    <Button variant="ghost" size="sm" asChild>
                        <a href={site.github} target="_blank" rel="noreferrer">
                            GitHub
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
}
