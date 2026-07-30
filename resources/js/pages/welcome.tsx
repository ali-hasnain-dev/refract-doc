import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    BookOpen,
    Database,
    FormInput,
    Github,
    LayoutDashboard,
    PanelsTopLeft,
    ScrollText,
    Table as TableIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import DocsThemeToggle from '@/components/docs/docs-theme-toggle';
import { Button } from '@/components/ui/button';
import type { DocsNavGroup, DocsSite } from '@/types/docs';

const GROUP_ICONS: Record<string, LucideIcon> = {
    Resources: Database,
    Forms: FormInput,
    Tables: TableIcon,
    Infolists: ScrollText,
    Widgets: LayoutDashboard,
    Panels: PanelsTopLeft,
    Notifications: Bell,
    Reference: BookOpen,
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
    Resources: 'Model → CRUD mapping, auto-discovery, and resource options.',
    Forms: '20+ field types, validation, layout, and custom fields.',
    Tables: 'Table builder, row actions, filters, search, inline editing.',
    Infolists: 'A read-only builder for detail and show pages.',
    Widgets: 'Stats, Chart, and Table widgets for the dashboard.',
    Panels: 'Branding, layout, themes, navigation, and plugins.',
    Notifications: 'Flash toasts and the useNotify() React hook.',
    Reference: 'HTTP endpoints, the roadmap, and monorepo internals.',
};

export default function Welcome({
    nav,
    site,
}: {
    nav: DocsNavGroup[];
    site: DocsSite;
}) {
    const featureGroups = nav.filter(
        (group) =>
            group.label !== 'Getting Started' && group.label !== 'Reference',
    );
    const referenceGroup = nav.find((group) => group.label === 'Reference');
    const firstSlug = nav[0]?.items[0]?.slug ?? 'getting-started';

    return (
        <>
            <Head title={`${site.name} — ${site.tagline}`} />

            <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
                <div
                    aria-hidden
                    className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] animate-glow"
                />

                <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <span className="font-semibold">{site.name}</span>
                    <nav className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/docs/${firstSlug}`} prefetch>
                                Docs
                            </Link>
                        </Button>
                        <DocsThemeToggle />
                        <Button variant="ghost" size="icon" asChild>
                            <a
                                href={site.github}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                            >
                                <Github className="size-4" />
                            </a>
                        </Button>
                    </nav>
                </header>

                <main>
                    <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
                        <p
                            className="mb-4 animate-fade-up text-sm font-medium tracking-wide text-muted-foreground uppercase"
                            style={{ animationDelay: '0ms' }}
                        >
                            Laravel · React 19 · Inertia v3
                        </p>
                        <h1
                            className="animate-fade-up text-4xl font-bold tracking-tight text-balance sm:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            {site.name}
                        </h1>
                        <p
                            className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-balance text-muted-foreground"
                            style={{ animationDelay: '120ms' }}
                        >
                            {site.tagline} Define PHP resources — get a fully
                            interactive, Filament-quality admin panel for free.
                        </p>
                        <div
                            className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-3"
                            style={{ animationDelay: '180ms' }}
                        >
                            <Button size="lg" asChild>
                                <Link href={`/docs/${firstSlug}`} prefetch>
                                    Get Started
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <a
                                    href={site.github}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Github className="size-4" />
                                    View on GitHub
                                </a>
                            </Button>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6 pb-24">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {featureGroups.map((group, index) => {
                                const Icon =
                                    GROUP_ICONS[group.label] ?? BookOpen;
                                const href = `/docs/${group.items[0]?.slug}`;

                                return (
                                    <Link
                                        key={group.label}
                                        href={href}
                                        prefetch
                                        className="group animate-fade-up rounded-xl border border-border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/50 hover:shadow-lg"
                                        style={{
                                            animationDelay: `${260 + index * 60}ms`,
                                        }}
                                    >
                                        <span className="inline-flex rounded-lg bg-primary/10 p-2 text-primary transition-transform duration-300 group-hover:scale-110">
                                            <Icon className="size-5" />
                                        </span>
                                        <h2 className="mt-3 font-semibold">
                                            {group.label}
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {GROUP_DESCRIPTIONS[group.label]}
                                        </p>
                                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                                            Explore
                                            <ArrowRight className="size-3.5" />
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
                        <p>Built on Laravel, React, and Inertia.js.</p>
                        {referenceGroup && (
                            <nav className="flex items-center gap-4">
                                {referenceGroup.items.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={`/docs/${item.slug}`}
                                        prefetch
                                        className="hover:text-foreground"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}
