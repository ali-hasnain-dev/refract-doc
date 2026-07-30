import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import DocsSearch from '@/components/docs/docs-search';
import DocsSidebar from '@/components/docs/docs-sidebar';
import DocsToc from '@/components/docs/docs-toc';
import DocsTopbar from '@/components/docs/docs-topbar';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { DocsNavGroup, DocsSite, DocsTocItem } from '@/types/docs';

/**
 * This is wired up as a *persistent* layout via the `layout` resolver in
 * app.tsx (it returns this component directly for every `docs/*` page
 * rather than `null`). Inertia keeps a persistent layout mounted across
 * page-to-page visits and only swaps the inner page component — so the
 * sidebar's scroll position, the search dialog, and the mobile nav sheet
 * all survive navigation instead of being torn down and rebuilt on every
 * click. All of `docs/show`'s Inertia props are spread onto this
 * component automatically (that's how the global layout mechanism works),
 * so the prop names below must match the controller's response shape.
 */
export default function DocsLayout({
    nav,
    site,
    slug,
    toc,
    children,
}: {
    nav: DocsNavGroup[];
    site: DocsSite;
    slug: string;
    toc?: DocsTocItem[];
    children: ReactNode;
}) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setSearchOpen((open) => !open);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <a
                href="#docs-main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
                Skip to content
            </a>

            <DocsTopbar
                site={site}
                onOpenSearch={() => setSearchOpen(true)}
                onOpenNav={() => setMobileNavOpen(true)}
            />

            <div className="mx-auto flex max-w-7xl items-start px-4 lg:px-8">
                <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto py-8 pr-6 lg:block">
                    <DocsSidebar nav={nav} activeSlug={slug} />
                </aside>

                <main id="docs-main" className="min-w-0 flex-1 py-8 lg:px-8">
                    <div className="flex gap-10">
                        <div className="min-w-0 flex-1">{children}</div>

                        {toc && toc.length > 0 && (
                            <aside className="sticky top-20 hidden h-fit w-48 shrink-0 xl:block">
                                <DocsToc toc={toc} />
                            </aside>
                        )}
                    </div>
                </main>
            </div>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent side="left" className="w-72 gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{site.name}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <DocsSidebar
                            nav={nav}
                            activeSlug={slug}
                            onNavigate={() => setMobileNavOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <DocsSearch
                nav={nav}
                open={searchOpen}
                onOpenChange={setSearchOpen}
            />
        </div>
    );
}
