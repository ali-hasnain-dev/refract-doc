import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import DocsContent from '@/components/docs/docs-content';
import type { DocsNeighbour, DocsSite } from '@/types/docs';

// Note: `nav`, `site`, `slug`, and `toc` are also part of this page's
// Inertia props, but they're consumed by DocsLayout (see app.tsx's layout
// resolver for `docs/*`), which renders as a persistent wrapper around
// this component rather than being called from inside it. Keeping the
// layout outside is what lets the sidebar's scroll position, the search
// dialog, and the mobile nav sheet survive from one docs page to the next.
export default function DocsShow({
    site,
    slug,
    title,
    excerpt,
    html,
    prev,
    next,
}: {
    site: DocsSite;
    slug: string;
    title: string;
    excerpt: string | null;
    html: string;
    prev: DocsNeighbour | null;
    next: DocsNeighbour | null;
}) {
    return (
        <>
            <Head title={`${title} - ${site.name}`}>
                {excerpt && <meta name="description" content={excerpt} />}
            </Head>

            <article className="mx-auto w-full max-w-3xl">
                <header className="mb-8 space-y-2">
                    <h1
                        style={{ viewTransitionName: 'docs-title' }}
                        className="text-3xl font-bold tracking-tight text-foreground"
                    >
                        {title}
                    </h1>
                    {excerpt && (
                        <p className="text-lg text-muted-foreground">
                            {excerpt}
                        </p>
                    )}
                </header>

                <DocsContent html={html} />

                <footer className="mt-12 space-y-6 border-t border-border pt-6">
                    <a
                        href={`${site.github}/edit/main/docs/${slug}.md`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Pencil className="size-3.5" />
                        Edit this page on GitHub
                    </a>

                    <nav className="grid gap-3 sm:grid-cols-2">
                        {prev ? (
                            <Link
                                href={`/docs/${prev.slug}`}
                                prefetch
                                className="group flex flex-col items-start gap-1 rounded-lg border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted-foreground/40 hover:bg-accent/40 hover:shadow-sm"
                            >
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                                    Previous
                                </span>
                                <span className="font-medium text-foreground">
                                    {prev.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}

                        {next && (
                            <Link
                                href={`/docs/${next.slug}`}
                                prefetch
                                className="group flex flex-col items-end gap-1 rounded-lg border border-border p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-muted-foreground/40 hover:bg-accent/40 hover:shadow-sm sm:col-start-2"
                            >
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    Next
                                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </span>
                                <span className="font-medium text-foreground">
                                    {next.title}
                                </span>
                            </Link>
                        )}
                    </nav>
                </footer>
            </article>
        </>
    );
}
