import { useEffect } from 'react';
import type { RefObject } from 'react';

const COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';

const CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * Wraps every `<pre>` block rendered from markdown with a copy-to-clipboard
 * button. Runs independently of syntax highlighting so copying works the
 * instant the page paints, not after Shiki finishes.
 */
export function useCopyableCodeBlocks(
    containerRef: RefObject<HTMLElement | null>,
    dependency: unknown,
): void {
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const blocks = Array.from(container.querySelectorAll('pre')).filter(
            (pre) => pre.parentElement?.dataset.codeWrapped !== 'true',
        );

        const cleanups: Array<() => void> = [];

        for (const pre of blocks) {
            const wrapper = document.createElement('div');
            wrapper.className = 'docs-code-block group/code relative';
            wrapper.dataset.codeWrapped = 'true';

            pre.replaceWith(wrapper);
            wrapper.appendChild(pre);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'docs-copy-button';
            button.setAttribute('aria-label', 'Copy code to clipboard');
            button.innerHTML = COPY_ICON;

            let resetTimer: ReturnType<typeof setTimeout> | undefined;

            const handleClick = () => {
                const source =
                    pre.querySelector('code')?.textContent ??
                    pre.textContent ??
                    '';

                if (!navigator.clipboard) {
                    return;
                }

                navigator.clipboard
                    .writeText(source)
                    .then(() => {
                        button.innerHTML = CHECK_ICON;
                        button.classList.add('is-copied');
                        window.clearTimeout(resetTimer);
                        resetTimer = window.setTimeout(() => {
                            button.innerHTML = COPY_ICON;
                            button.classList.remove('is-copied');
                        }, 1600);
                    })
                    .catch(() => {
                        // Clipboard permission denied — nothing useful to do.
                    });
            };

            button.addEventListener('click', handleClick);
            wrapper.appendChild(button);

            cleanups.push(() => {
                button.removeEventListener('click', handleClick);
                window.clearTimeout(resetTimer);
            });
        }

        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
}
