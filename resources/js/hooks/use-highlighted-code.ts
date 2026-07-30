import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Fenced code blocks arrive from the server as plain, escaped text inside
 * `<pre><code class="language-xxx">`. This hook progressively enhances
 * them in the browser with Shiki (dual light/dark theme, CSS-variable
 * based) once the docs content has mounted, so the page is readable
 * immediately and gains syntax colour a beat later.
 */

const LANG_ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    sh: 'bash',
    shell: 'bash',
    text: 'text',
    plaintext: 'text',
};

const BUNDLED_LANGS = [
    'php',
    'javascript',
    'typescript',
    'tsx',
    'jsx',
    'bash',
    'json',
    'css',
    'html',
    'text',
] as const;

type BundledLang = (typeof BUNDLED_LANGS)[number];

function resolveLang(raw: string | undefined): BundledLang {
    const candidate = raw ? (LANG_ALIASES[raw] ?? raw) : 'text';

    return (BUNDLED_LANGS as readonly string[]).includes(candidate)
        ? (candidate as BundledLang)
        : 'text';
}

let highlighterPromise: ReturnType<
    typeof import('shiki').createHighlighter
> | null = null;

function getHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = import('shiki').then(({ createHighlighter }) =>
            createHighlighter({
                themes: ['github-light', 'github-dark'],
                langs: [...BUNDLED_LANGS],
            }),
        );
    }

    return highlighterPromise;
}

export function useHighlightedCode(
    containerRef: RefObject<HTMLElement | null>,
    dependency: unknown,
): void {
    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const blocks = Array.from(
            container.querySelectorAll<HTMLElement>(
                'pre > code[class*="language-"]',
            ),
        ).filter((code) => code.parentElement?.dataset.highlighted !== 'true');

        if (blocks.length === 0) {
            return;
        }

        let cancelled = false;

        getHighlighter()
            .then((highlighter) => {
                if (cancelled) {
                    return;
                }

                for (const code of blocks) {
                    const pre = code.parentElement;

                    if (!pre) {
                        continue;
                    }

                    const langMatch = code.className.match(/language-(\S+)/);
                    const lang = resolveLang(langMatch?.[1]);
                    const source = code.textContent ?? '';

                    let highlightedHtml: string;

                    try {
                        highlightedHtml = highlighter.codeToHtml(source, {
                            lang,
                            themes: {
                                light: 'github-light',
                                dark: 'github-dark',
                            },
                            defaultColor: false,
                        });
                    } catch {
                        continue;
                    }

                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = highlightedHtml;

                    const highlightedPre = wrapper.firstElementChild;

                    if (highlightedPre) {
                        highlightedPre.setAttribute('data-highlighted', 'true');
                        highlightedPre.setAttribute('data-lang', lang);
                        pre.replaceWith(highlightedPre);
                    }
                }
            })
            .catch(() => {
                // Highlighting is a progressive enhancement — leave the
                // plain, still-readable code blocks in place on failure.
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
}
