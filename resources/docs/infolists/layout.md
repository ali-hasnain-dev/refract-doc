# Infolist Layout

Layout components group entries and nest arbitrarily — a `Section` can contain
a `Grid`, which can contain a `Tabs`, and so on. Every layout component
supports `hidden()`/`visible()` (dropped from the tree entirely when hidden
for the record) and `inlineLabel()` (cascades a default to descendant entries
unless they set their own).

## Section

A bordered, headed container — optionally collapsible.

```php
use Larafusion\Infolists\Layout\Section;

Section::make('Billing')
    ->description('Payment and invoice details')
    ->icon('credit-card')
    ->columns(2)
    ->collapsible()
    ->collapsed()               // starts collapsed; implies collapsible()
    ->schema([
        TextEntry::make('plan'),
        TextEntry::make('renews_at'),
    ]);
```

`label()`/`description()` accept a string or a closure resolved against the
record.

## Grid

A responsive multi-column grid with no heading or border.

```php
use Larafusion\Infolists\Layout\Grid;

Grid::make(3)->schema([...]);

// Or a breakpoint map:
Grid::make(['default' => 1, 'md' => 2, 'lg' => 3])->schema([...]);
```

## Tabs

```php
use Larafusion\Infolists\Layout\Tabs;
use Larafusion\Infolists\Layout\Tab;

Tabs::make()
    ->default('Details')
    ->tabs([
        Tab::make('Details')->schema([...]),
        Tab::make('Refund')
            ->icon('rotate-ccw')
            ->badge('New')
            ->hidden(fn ($record) => ! $record->refunded)
            ->schema([...]),
    ]);
```

Each `Tab` is resolved and filtered by visibility independently — a tab
hidden for the current record is dropped from the response entirely, not
rendered empty.

## Fieldset

A lighter-weight bordered group with a legend label — no heading row,
description, icon, or collapsibility. Use it for a handful of closely related
entries where a full `Section` would be too heavy.

```php
use Larafusion\Infolists\Layout\Fieldset;

Fieldset::make('Metadata')->columns(2)->schema([...]);
```

## Split

Lays its children out in a single responsive row (rather than stacking them) —
useful for pairing a wide entry with a narrow one side by side. Collapses to a
stacked column below the given breakpoint.

```php
use Larafusion\Infolists\Layout\Split;

Split::make([
    TextEntry::make('description'),
    IconEntry::make('status')->boolean(),
])->collapseBelow('lg'); // sm | md (default) | lg | xl
```

## Group

A purely logical grouping with no visual wrapper — apply a single
`hidden()`/`visible()`/`inlineLabel()` to a cluster of entries at once without
adding a border or heading.

```php
use Larafusion\Infolists\Layout\Group;

Group::make([
    TextEntry::make('refund_amount'),
    TextEntry::make('refund_reason'),
])->hidden(fn ($record) => ! $record->refunded);
```

On the frontend, `Group` renders with `display: contents` so its children
still participate directly in the ancestor grid/flex layout.

## Nesting and inline label inheritance

```php
Infolist::make()
    ->inlineLabel() // cascades to every entry below, unless overridden
    ->schema([
        Section::make('Overview')->schema([
            TextEntry::make('title'),               // inherits inlineLabel(true)
            TextEntry::make('summary')->inlineLabel(false), // opts back out
        ]),
    ]);
```
