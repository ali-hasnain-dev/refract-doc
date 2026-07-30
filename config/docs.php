<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site Metadata
    |--------------------------------------------------------------------------
    |
    | Shown in the top bar, the homepage hero, and page <title> tags.
    |
    */

    'name' => 'Larafusion',

    'tagline' => 'A Filament-inspired admin panel package for Laravel, React & Inertia.',

    'github' => 'https://github.com/larafusion/larafusion',

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    |
    | The sidebar/search structure for the documentation. Each item's "file"
    | is relative to resources/docs, and "slug" is the public /docs/{slug}
    | path. Order here is the order rendered in the sidebar and used to
    | compute each page's previous/next links.
    |
    */

    'nav' => [
        [
            'label' => 'Getting Started',
            'items' => [
                ['slug' => 'getting-started', 'file' => 'getting-started.md', 'title' => 'Getting Started'],
                ['slug' => 'cli-commands', 'file' => 'cli-commands.md', 'title' => 'CLI Commands'],
                ['slug' => 'enums', 'file' => 'enums.md', 'title' => 'Enums'],
                ['slug' => 'upgrade', 'file' => 'upgrade.md', 'title' => 'Upgrade Guide'],
            ],
        ],
        [
            'label' => 'Resources',
            'items' => [
                ['slug' => 'resources/overview', 'file' => 'resources/overview.md', 'title' => 'Overview'],
                ['slug' => 'resources/actions', 'file' => 'resources/actions.md', 'title' => 'Actions'],
                ['slug' => 'resources/soft-deletes', 'file' => 'resources/soft-deletes.md', 'title' => 'Soft Deletes'],
            ],
        ],
        [
            'label' => 'Forms',
            'items' => [
                ['slug' => 'forms/overview', 'file' => 'forms/overview.md', 'title' => 'Overview'],
            ],
        ],
        [
            'label' => 'Tables',
            'items' => [
                ['slug' => 'tables/overview', 'file' => 'tables/overview.md', 'title' => 'Overview'],
                ['slug' => 'tables/filters', 'file' => 'tables/filters.md', 'title' => 'Filters'],
                ['slug' => 'tables/inline-editing', 'file' => 'tables/inline-editing.md', 'title' => 'Inline Editing'],
                ['slug' => 'tables/global-search', 'file' => 'tables/global-search.md', 'title' => 'Global Search'],
                ['slug' => 'tables/export-import', 'file' => 'tables/export-import.md', 'title' => 'Export & Import'],
                ['slug' => 'tables/text-column', 'file' => 'tables/text-column.md', 'title' => 'TextColumn'],
                ['slug' => 'tables/badge-column', 'file' => 'tables/badge-column.md', 'title' => 'BadgeColumn'],
                ['slug' => 'tables/boolean-column', 'file' => 'tables/boolean-column.md', 'title' => 'BooleanColumn'],
                ['slug' => 'tables/date-column', 'file' => 'tables/date-column.md', 'title' => 'DateColumn'],
                ['slug' => 'tables/image-column', 'file' => 'tables/image-column.md', 'title' => 'ImageColumn'],
                ['slug' => 'tables/icon-column', 'file' => 'tables/icon-column.md', 'title' => 'IconColumn'],
                ['slug' => 'tables/select-column', 'file' => 'tables/select-column.md', 'title' => 'SelectColumn'],
                ['slug' => 'tables/toggle-column', 'file' => 'tables/toggle-column.md', 'title' => 'ToggleColumn'],
            ],
        ],
        [
            'label' => 'Infolists',
            'items' => [
                ['slug' => 'infolists/overview', 'file' => 'infolists/overview.md', 'title' => 'Overview'],
                ['slug' => 'infolists/layout', 'file' => 'infolists/layout.md', 'title' => 'Layout'],
                ['slug' => 'infolists/text-entry', 'file' => 'infolists/text-entry.md', 'title' => 'TextEntry'],
                ['slug' => 'infolists/icon-entry', 'file' => 'infolists/icon-entry.md', 'title' => 'IconEntry'],
                ['slug' => 'infolists/image-entry', 'file' => 'infolists/image-entry.md', 'title' => 'ImageEntry'],
                ['slug' => 'infolists/color-entry', 'file' => 'infolists/color-entry.md', 'title' => 'ColorEntry'],
                ['slug' => 'infolists/code-entry', 'file' => 'infolists/code-entry.md', 'title' => 'CodeEntry'],
                ['slug' => 'infolists/key-value-entry', 'file' => 'infolists/key-value-entry.md', 'title' => 'KeyValueEntry'],
                ['slug' => 'infolists/repeatable-entry', 'file' => 'infolists/repeatable-entry.md', 'title' => 'RepeatableEntry'],
            ],
        ],
        [
            'label' => 'Widgets',
            'items' => [
                ['slug' => 'widgets/overview', 'file' => 'widgets/overview.md', 'title' => 'Overview'],
            ],
        ],
        [
            'label' => 'Panels',
            'items' => [
                ['slug' => 'panels/overview', 'file' => 'panels/overview.md', 'title' => 'Panel Configuration'],
                ['slug' => 'panels/navigation', 'file' => 'panels/navigation.md', 'title' => 'Navigation'],
                ['slug' => 'panels/themes', 'file' => 'panels/themes.md', 'title' => 'Themes'],
                ['slug' => 'panels/plugins', 'file' => 'panels/plugins.md', 'title' => 'Plugins'],
            ],
        ],
        [
            'label' => 'Notifications',
            'items' => [
                ['slug' => 'notifications/overview', 'file' => 'notifications/overview.md', 'title' => 'Overview'],
            ],
        ],
        [
            'label' => 'Reference',
            'items' => [
                ['slug' => 'internals', 'file' => 'internals.md', 'title' => 'HTTP Endpoints'],
                ['slug' => 'roadmap', 'file' => 'roadmap.md', 'title' => 'Feature Roadmap'],
                ['slug' => 'monorepo-split', 'file' => 'monorepo-split.md', 'title' => 'Monorepo Split'],
            ],
        ],
    ],

];
