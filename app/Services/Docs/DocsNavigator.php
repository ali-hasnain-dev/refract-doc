<?php

namespace App\Services\Docs;

/**
 * Reads the config('docs.nav') tree and answers navigation questions:
 * does this slug exist, what file backs it, and what are its
 * previous/next neighbours in reading order.
 */
class DocsNavigator
{
    /** @var array<int, array{slug: string, file: string, title: string}> */
    private readonly array $flatItems;

    public function __construct()
    {
        $items = [];

        foreach (config('docs.nav', []) as $group) {
            foreach ($group['items'] as $item) {
                $items[] = $item;
            }
        }

        $this->flatItems = $items;
    }

    public function defaultSlug(): string
    {
        return $this->flatItems[0]['slug'] ?? 'getting-started';
    }

    /**
     * @return array{slug: string, file: string, title: string}|null
     */
    public function find(string $slug): ?array
    {
        foreach ($this->flatItems as $item) {
            if ($item['slug'] === $slug) {
                return $item;
            }
        }

        return null;
    }

    /**
     * @return array{prev: array{slug: string, title: string}|null, next: array{slug: string, title: string}|null}
     */
    public function neighbours(string $slug): array
    {
        $index = null;

        foreach ($this->flatItems as $position => $item) {
            if ($item['slug'] === $slug) {
                $index = $position;

                break;
            }
        }

        if ($index === null) {
            return ['prev' => null, 'next' => null];
        }

        return [
            'prev' => isset($this->flatItems[$index - 1])
                ? ['slug' => $this->flatItems[$index - 1]['slug'], 'title' => $this->flatItems[$index - 1]['title']]
                : null,
            'next' => isset($this->flatItems[$index + 1])
                ? ['slug' => $this->flatItems[$index + 1]['slug'], 'title' => $this->flatItems[$index + 1]['title']]
                : null,
        ];
    }
}
