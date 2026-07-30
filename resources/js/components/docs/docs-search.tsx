import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { DocsNavGroup } from '@/types/docs';

type SearchEntry = {
    slug: string;
    title: string;
    group: string;
};

function flattenNav(nav: DocsNavGroup[]): SearchEntry[] {
    return nav.flatMap((group) =>
        group.items.map((item) => ({
            slug: item.slug,
            title: item.title,
            group: group.label,
        })),
    );
}

export default function DocsSearch({
    nav,
    open,
    onOpenChange,
}: {
    nav: DocsNavGroup[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const entries = useMemo(() => flattenNav(nav), [nav]);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (needle === '') {
            return entries.slice(0, 40);
        }

        return entries
            .filter(
                (entry) =>
                    entry.title.toLowerCase().includes(needle) ||
                    entry.group.toLowerCase().includes(needle),
            )
            .slice(0, 40);
    }, [entries, query]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const navigateTo = (slug: string) => {
        onOpenChange(false);
        router.visit(`/docs/${slug}`);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const entry = results[activeIndex];

            if (entry) {
                navigateTo(entry.slug);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
            >
                <DialogTitle className="sr-only">
                    Search documentation
                </DialogTitle>
                <div className="flex items-center gap-3 border-b border-border px-4">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        type="text"
                        placeholder="Search documentation..."
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline-block">
                        Esc
                    </kbd>
                </div>
                <ul className="max-h-80 overflow-y-auto p-2">
                    {results.length === 0 && (
                        <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No results for &ldquo;{query}&rdquo;
                        </li>
                    )}
                    {results.map((entry, index) => (
                        <li key={entry.slug}>
                            <button
                                type="button"
                                onClick={() => navigateTo(entry.slug)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                    index === activeIndex
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-foreground',
                                )}
                            >
                                <span>{entry.title}</span>
                                <span className="text-xs text-muted-foreground">
                                    {entry.group}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
