# RepeatableEntry

`Larafusion\Infolists\Entries\RepeatableEntry` — repeats a nested schema
once per item of a collection: a plain array, a JSON column, or an Eloquent
to-many relationship (`hasMany`, `belongsToMany`, `morphMany`, …) all work
through the exact same API.

```php
use Larafusion\Infolists\Entries\RepeatableEntry;
use Larafusion\Infolists\Entries\TextEntry;

RepeatableEntry::make('lineItems')
    ->schema([
        TextEntry::make('product'),
        TextEntry::make('qty'),
        TextEntry::make('price')->money(),
    ]);

RepeatableEntry::make('reviews')
    ->schema([
        TextEntry::make('commenter.name')->label('Reviewer'),
        TextEntry::make('rating'),
        TextEntry::make('comment'),
    ]);
```

## Data sources

`RepeatableEntry` resolves its value the same way every entry does (dot-
notation attribute lookup, `->default()`, `->state(Closure)`), then
normalizes whatever comes back:

- **A plain PHP array** (including an Eloquent `array`/`json`-cast column) —
  each element becomes one repeated item.
- **A raw JSON-string column** (no cast defined) — decoded automatically,
  identical to the array case.
- **An Eloquent to-many relationship** — `hasMany`/`belongsToMany`/
  `morphMany`/etc. all resolve naturally, since accessing a relationship
  name on a model already returns its `Collection`; no separate opt-in
  method is needed.
- **A `->state(fn () => [...])` closure** — return a plain array (of arrays,
  or of Models) and it's normalized the same way.

Each repeated row — whether a real related Eloquent model or a plain PHP
array — is resolved by every nested entry/layout component exactly the same
way. A plain array row is wrapped in a lightweight, never-persisted
`Larafusion\Infolists\Support\ArrayItemModel` first, so relationship-style
dot-notation, `data_get()`, and every existing Entry's resolution logic all
work completely unchanged either way.

Anything that isn't a non-empty array/collection after normalization —
`null`, an empty array, an unparseable JSON string, a bare scalar — is
treated as **no data**: the entry renders its `placeholder()`, exactly like
an empty value on any other entry. A stray non-array/non-model row inside
otherwise-valid data is skipped rather than crashing the whole entry.

## Nested schema

```php
RepeatableEntry::make('reviews')->schema([
    TextEntry::make('rating')->badge(),
    TextEntry::make('commenter.name'),   // relationship dot-notation, relative to each review
    ImageEntry::make('commenter.avatar'),
]);
```

Any entry or layout component (`Section`, `Grid`, `Tabs`, …) can appear
inside `schema()` — including another `RepeatableEntry`, for genuinely
nested repeaters. Dot-notation inside the nested schema resolves relative to
each repeated _item_, not the parent record.

## Layout: columns vs. grid

These control two different things and are easy to mix up:

```php
RepeatableEntry::make('lineItems')
    ->schema([TextEntry::make('product'), TextEntry::make('qty'), TextEntry::make('price')])
    ->columns(3)  // each item's own 3 fields laid out side by side
    ->grid(2);    // the repeated items themselves arranged 2-per-row
```

- **`columns(int|array)`** — how each individual repeated item's _own_
  fields are laid out internally (same shape as `Section::columns()`).
  Default: `1`.
- **`grid(int|array)`** — arranges the repeated _items_ themselves into a
  responsive grid of cards instead of the default vertical stack. Both
  accept a plain int or a breakpoint map (`['default' => 1, 'lg' => 3]`).
  Default: not set (vertical stack).

## Card container

```php
RepeatableEntry::make('lineItems')->schema([...])->contained(false);
```

By default (`contained(true)`), each repeated item is wrapped in its own
bordered card. `contained(false)` removes that border — useful when nesting
a `RepeatableEntry` inside a `Section` that already provides its own
container, to avoid a "card inside a card" look.

## Table mode

```php
use Larafusion\Infolists\Layout\TableColumn;

RepeatableEntry::make('lineItems')
    ->schema([
        TextEntry::make('product'),
        TextEntry::make('qty'),
        TextEntry::make('price')->money(),
    ])
    ->table([
        TableColumn::make('Product'),
        TableColumn::make('Quantity')->alignment('end')->width('6rem'),
        TableColumn::make('Price')->alignment('end'),
    ]);
```

`table()` switches from card/stacked presentation to a real table: each
`TableColumn` pairs **positionally** with the same-index component in
`schema()` — the first column shows the first schema component's value for
every row, and so on. Each cell renders without repeating its own field
label, since the column header already serves that purpose.

### TableColumn options

| Method                                      | Description                                                                          | Default     |
| ------------------------------------------- | ------------------------------------------------------------------------------------ | ----------- |
| `label(string)`                             | The header text (also settable via `TableColumn::make($label)`)                      | —           |
| `hiddenHeaderLabel(bool $condition = true)` | Visually hide the header text (kept for screen readers)                              | `false`     |
| `wrapHeader(bool $condition = true)`        | Allow the header to wrap instead of staying on one line                              | `false`     |
| `alignment(string)`                         | `'start'` \| `'center'` \| `'end'` \| `'justify'` — applies to both header and cells | `'start'`   |
| `width(string)`                             | A fixed CSS width (e.g. `'6rem'`, `'20%'`)                                           | none (auto) |

## Empty states

When there's no valid data to repeat, the entry falls back to
`placeholder()` like every other entry:

```php
RepeatableEntry::make('lineItems')->schema([...])->placeholder('No items yet');
```

## Tooltips, labels, and placeholders

Every shared [base Entry](overview.md#options-base-entry) feature works —
`label()`, `placeholder()`, `tooltip()`, `default()`, `hidden()`/`visible()`,
`inlineLabel()`, `alignment()`, and the slots.

## Accessibility

Table mode renders a real semantic `<table>` with `<th scope="col">` column
headers — including for `hiddenHeaderLabel()`, which keeps the header text
present (visually hidden) rather than removing it, so assistive technology
still announces the column's purpose. The table sits in a horizontally
scrollable container as a safety net on narrow viewports. Card mode uses the
same `<dl>`/`<dt>`/`<dd>` structure as every other part of the Infolist
system.

## Options

| Method                              | Description                                       | Default               |
| ----------------------------------- | ------------------------------------------------- | --------------------- |
| `schema(array)`                     | The components to repeat for each item            | `[]`                  |
| `columns(int\|array)`               | Column layout for each item's own fields          | `1`                   |
| `grid(int\|array)`                  | Arrange the repeated items into a responsive grid | none (vertical stack) |
| `contained(bool $condition = true)` | Wrap each item in its own bordered card           | `true`                |
| `table(array<TableColumn>)`         | Switch to table-presentation mode                 | none (card mode)      |

Plus every method on the [base Entry API](overview.md#options-base-entry).

## Eager-loading and relationships

When a `RepeatableEntry`'s name matches an actual relationship method on the
resource's Eloquent model, it's eager-loaded automatically before the record
is fetched — the same N+1 avoidance every other entry's dot-notation gets.
Since the same `make('name')` API also has to support a plain array/JSON
attribute with the same name shape, this eager-load decision is made
defensively: the resolved model class is checked for a matching method
before assuming it's safe to `->with()`, so a plain array/JSON attribute is
never mistaken for a relationship (which would otherwise throw at query
time). Relationships still resolve correctly without eager-loading — just
lazily, on first access, exactly like accessing an un-eager-loaded relation
anywhere else in Laravel.

Relation paths used _inside_ the nested schema (e.g. `TextEntry::make('commenter.name')`
in the reviews example above) are eager-loaded too, nested under the
repeater's own relationship (`reviews.commenter`).

> **Known scope limit:** if your model happens to define a method with the
> exact same name as a plain array/JSON attribute you're repeating over
> (unusual, but possible), eager-loading will assume it's a relationship and
> throw at query time. Rename one of the two to avoid the collision.

## How it's serialized

`RepeatableEntry::toArray()` never sends a closure, model, or query object to
the client. Each repeated row is resolved server-side using the exact same
recursive schema-resolution helper (`Infolist::serializeSchema()`) that
`Section`/`Grid`/every other layout container already uses for their own
nested content — so `items` in the final payload is a list of already-fully-
resolved nested schemas, one per row, in the same shape as any other
`components` array in this package. The payload is assembled through
`Larafusion\Infolists\Support\RepeatableEntryConfig`, composed from
`RepeatableLayoutConfig` (`columns`/`grid`/`contained`) and a list of
`Larafusion\Infolists\Support\TableColumnConfig` (only present in table
mode). `state` holds the repeated item count (or `null` when there's
nothing to show) — the same "emptiness signal" `EntryWrapper`'s generic
placeholder handling already uses for every entry type; the actual
renderable data lives in `items`. The React `RepeatableEntryView` component
is purely declarative: it only decides between table- and card-presentation
layout, delegating all nested rendering to the same `SchemaRenderer`/
`EntryWrapper` components used everywhere else in the Infolist system.
