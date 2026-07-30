import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { DocsNavGroup } from '@/types/docs';

export default function DocsSidebar({
    nav,
    activeSlug,
    onNavigate,
}: {
    nav: DocsNavGroup[];
    activeSlug: string;
    onNavigate?: () => void;
}) {
    return (
        <nav aria-label="Documentation" className="space-y-6 pb-10 text-sm">
            {nav.map((group) => (
                <div key={group.label}>
                    <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {group.label}
                    </p>
                    <ul className="space-y-0.5">
                        {group.items.map((item) => {
                            const isActive = item.slug === activeSlug;

                            return (
                                <li key={item.slug}>
                                    <Link
                                        href={`/docs/${item.slug}`}
                                        prefetch
                                        onClick={onNavigate}
                                        className={cn(
                                            'group relative block rounded-md px-2 py-1.5 transition-all duration-200',
                                            isActive
                                                ? 'bg-accent font-medium text-accent-foreground shadow-sm'
                                                : 'text-muted-foreground hover:translate-x-0.5 hover:bg-accent/60 hover:text-foreground',
                                        )}
                                        aria-current={
                                            isActive ? 'page' : undefined
                                        }
                                    >
                                        {isActive && (
                                            <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                                        )}
                                        {item.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
