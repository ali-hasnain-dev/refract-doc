<?php

namespace App\Services\Docs;

use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use League\CommonMark\Extension\ExternalLink\ExternalLinkExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;

/**
 * Converts a documentation markdown file into ready-to-render HTML.
 *
 * Rendering is intentionally cheap: markdown is parsed with league/commonmark
 * (via Str::markdown()), heading ids come from the HeadingPermalink
 * extension, and relative *.md links are rewritten to /docs/{slug} routes.
 * The result is cached forever per file, keyed by the file's mtime, so a
 * request never re-parses markdown unless the source file actually changed.
 */
class DocsRenderer
{
    private readonly string $docsRoot;

    public function __construct()
    {
        $this->docsRoot = resource_path('docs');
    }

    /**
     * Render a documentation file, relative to resources/docs.
     */
    public function render(string $relativeFile): DocsPage
    {
        $absolutePath = $this->docsRoot.'/'.$relativeFile;

        abort_unless(is_file($absolutePath), 404);

        $cacheKey = 'docs.page:'.$relativeFile.':'.filemtime($absolutePath);

        // Cache the plain array form rather than the DocsPage object itself.
        // Some cache stores/serializers can hand back a __PHP_Incomplete_Class
        // for cached objects depending on class-loading order; arrays have
        // no such failure mode, so we hydrate DocsPage fresh on every read.
        $data = Cache::rememberForever(
            $cacheKey,
            fn (): array => $this->build($relativeFile, $absolutePath)->toArray(),
        );

        return DocsPage::fromArray($data);
    }

    private function build(string $relativeFile, string $absolutePath): DocsPage
    {
        $markdown = file_get_contents($absolutePath);

        $host = parse_url(config('app.url'), PHP_URL_HOST) ?: 'localhost';

        $html = Str::markdown($markdown, [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
            'heading_permalink' => [
                'min_heading_level' => 2,
                'max_heading_level' => 3,
                'id_prefix' => '',
                'fragment_prefix' => '',
                'insert' => 'before',
                'apply_id_to_heading' => true,
                'html_class' => 'docs-heading-anchor',
                'aria_hidden' => true,
                'title' => 'Copy link to this section',
                // Rendered visually via a CSS ::before instead of a real
                // glyph, so the anchor never leaks stray characters into
                // heading textContent (title/TOC extraction reads that).
                'symbol' => '',
            ],
            'external_link' => [
                'internal_hosts' => $host,
                'open_in_new_window' => true,
                'html_class' => 'docs-external-link',
            ],
        ], [
            new HeadingPermalinkExtension,
            new ExternalLinkExtension,
        ]);

        return $this->postProcess($html, $relativeFile);
    }

    private function postProcess(string $html, string $relativeFile): DocsPage
    {
        $dom = new DOMDocument('1.0', 'UTF-8');

        libxml_use_internal_errors(true);
        $dom->loadHTML(
            '<?xml encoding="utf-8" ?><div id="docs-root">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
        );
        libxml_clear_errors();

        $root = $dom->getElementById('docs-root');

        $title = $this->extractTitle($root);
        $excerpt = $this->extractExcerpt($root);

        $xpath = new DOMXPath($dom);
        $currentDir = trim(dirname($relativeFile), '.');

        $this->rewriteInternalLinks($xpath, $root, $currentDir);
        $tableOfContents = $this->extractTableOfContents($xpath, $root);

        $bodyHtml = '';

        foreach (iterator_to_array($root->childNodes) as $node) {
            $bodyHtml .= $dom->saveHTML($node);
        }

        return new DocsPage($title, $excerpt, $bodyHtml, $tableOfContents);
    }

    private function extractTitle(DOMElement $root): string
    {
        foreach (iterator_to_array($root->childNodes) as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            if ($node->tagName === 'h1') {
                $title = trim($node->textContent);
                $root->removeChild($node);

                return $title;
            }

            break;
        }

        return 'Untitled';
    }

    private function extractExcerpt(DOMElement $root): ?string
    {
        foreach ($root->childNodes as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            if ($node->tagName === 'p') {
                $excerpt = trim($node->textContent);
                $root->removeChild($node);

                return $excerpt;
            }

            return null;
        }

        return null;
    }

    /**
     * @return array<int, array{id: string, text: string, level: int}>
     */
    private function extractTableOfContents(DOMXPath $xpath, DOMElement $root): array
    {
        $toc = [];

        foreach ($xpath->query('.//h2 | .//h3', $root) as $heading) {
            /** @var DOMElement $heading */
            $id = $heading->getAttribute('id');

            if ($id === '') {
                continue;
            }

            $toc[] = [
                'id' => $id,
                'text' => trim($heading->textContent),
                'level' => (int) substr($heading->tagName, 1),
            ];
        }

        return $toc;
    }

    private function rewriteInternalLinks(DOMXPath $xpath, DOMElement $root, string $currentDir): void
    {
        foreach ($xpath->query('.//a[@href]', $root) as $link) {
            /** @var DOMElement $link */
            $resolved = $this->resolveInternalLink($link->getAttribute('href'), $currentDir);

            if ($resolved !== null) {
                $link->setAttribute('href', $resolved);
                $link->setAttribute('data-docs-link', 'true');
            }
        }
    }

    private function resolveInternalLink(string $href, string $currentDir): ?string
    {
        if (! preg_match('/^([^#]*\.md)(#(.*))?$/', $href, $matches)) {
            return null;
        }

        $path = $matches[1];
        $fragment = $matches[3] ?? null;

        $candidate = $currentDir !== '' ? $currentDir.'/'.$path : $path;

        $absolute = realpath($this->docsRoot.'/'.$candidate);

        if ($absolute === false || ! str_starts_with($absolute, $this->docsRoot)) {
            return null;
        }

        $slug = ltrim(substr($absolute, strlen($this->docsRoot)), '/');
        $slug = preg_replace('/\.md$/', '', $slug);

        return '/docs/'.$slug.($fragment !== null ? '#'.$fragment : '');
    }
}
