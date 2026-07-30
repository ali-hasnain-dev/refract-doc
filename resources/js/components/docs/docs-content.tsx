import { router } from '@inertiajs/react';
import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { useCopyableCodeBlocks } from '@/hooks/use-copyable-code-blocks';
import { useHighlightedCode } from '@/hooks/use-highlighted-code';

export default function DocsContent({ html }: { html: string }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useCopyableCodeBlocks(containerRef, html);
    useHighlightedCode(containerRef, html);

    // Markdown is rendered to plain <a href> tags server-side. Internal
    // doc links (flagged with data-docs-link by DocsRenderer) are
    // intercepted here so they go through Inertia instead of a full page
    // reload — this is what keeps prefetching and view transitions working
    // for links that live inside the rendered article body.
    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        const target = (event.target as HTMLElement).closest('a');

        if (!target || target.dataset.docsLink !== 'true') {
            return;
        }

        const href = target.getAttribute('href');

        if (!href) {
            return;
        }

        event.preventDefault();
        router.visit(href);
    };

    return (
        <div
            ref={containerRef}
            className="docs-content"
            onClick={handleClick}

            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
