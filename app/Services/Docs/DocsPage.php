<?php

namespace App\Services\Docs;

/**
 * A single rendered documentation page.
 */
class DocsPage
{
    /**
     * @param  array<int, array{id: string, text: string, level: int}>  $tableOfContents
     */
    public function __construct(
        public readonly string $title,
        public readonly ?string $excerpt,
        public readonly string $html,
        public readonly array $tableOfContents,
    ) {}

    /**
     * @return array{title: string, excerpt: ?string, html: string, tableOfContents: array<int, array{id: string, text: string, level: int}>}
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'html' => $this->html,
            'tableOfContents' => $this->tableOfContents,
        ];
    }

    /**
     * @param  array{title: string, excerpt: ?string, html: string, tableOfContents: array<int, array{id: string, text: string, level: int}>}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            $data['title'],
            $data['excerpt'],
            $data['html'],
            $data['tableOfContents'],
        );
    }
}
