import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { DocsTocItem } from '@/types/docs';

export default function DocsToc({ toc }: { toc: DocsTocItem[] }) {
    const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

    useEffect(() => {
        setActiveId(toc[0]?.id ?? null);

        if (toc.length === 0) {
            return;
        }

        const headings = toc
            .map((item) => document.getElementById(item.id))
            .filter((element): element is HTMLElement => element !== null);

        if (headings.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );

                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-96px 0px -70% 0px', threshold: [0, 1] },
        );

        headings.forEach((heading) => observer.observe(heading));

        return () => observer.disconnect();
    }, [toc]);

    if (toc.length === 0) {
        return null;
    }

    return (
        <nav aria-label="On this page" className="text-sm">
            <p className="mb-3 font-medium text-foreground">On this page</p>
            <ul className="space-y-1 border-l border-border">
                {toc.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                '-ml-px block border-l py-1 pl-4 transition-all duration-200 ease-out',
                                item.level === 3 && 'pl-7 text-[13px]',
                                activeId === item.id
                                    ? 'border-foreground font-medium text-foreground'
                                    : 'border-transparent text-muted-foreground hover:translate-x-0.5 hover:border-muted-foreground/50 hover:text-foreground',
                            )}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
