# Infolists

`Larafusion\Infolists\Infolist` builds a read-only, schema-driven view of a
record — the display counterpart to the form builder. Define it on a resource's
`infolist()` method and the Show page renders it automatically, in place of the
default read-only form-field view.

```php
use Larafusion\Infolists\Infolist;
use Larafusion\Infolists\Entries\TextEntry;
use Larafusion\Infolists\Entries\IconEntry;
use Larafusion\Infolists\Layout\Section;

class PostResource extends Resource
{
    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make('Post details')
                ->description('Core information about this post')
                ->columns(2)
                ->schema([
                    TextEntry::make('title'),
                    TextEntry::make('author.name')->label('Author'),
                    TextEntry::make('status')->badge()->color('success'),
                    IconEntry::make('is_published')->boolean(),
                ]),
        ]);
    }
}
```

## Adding an infolist to a resource

`Resource::infolist(Infolist $infolist): Infolist` is optional. Left undefined,
it defaults to returning `$infolist` unchanged (matching Filament's own
default), and the Show page falls back to today's read-only form-field
rendering built from `form()` — no migration needed for existing resources.
Once you define it, `ResourceController::show()` resolves the whole schema
against the record and passes it to the frontend as a single, fully-resolved
`infolist` prop.

## Entries

An entry displays one piece of data. `TextEntry` is the default/most common
type; `IconEntry`, `ImageEntry`, `ColorEntry`, `CodeEntry`, `KeyValueEntry`,
and `RepeatableEntry` cover richer presentation. See the per-entry pages for
their specific options:

- [TextEntry](text-entry.md) — text, badges, colors, weight, prefixes/suffixes, money, enums
- [IconEntry](icon-entry.md) — value→icon mapping, or boolean check/x
- [ImageEntry](image-entry.md) — avatars/thumbnails, single image or a small gallery
- [ColorEntry](color-entry.md) — a swatch plus the raw color value
- [CodeEntry](code-entry.md) — syntax-highlighted, monospaced code blocks
- [KeyValueEntry](key-value-entry.md) — a one-dimensional associative array/JSON object as a key/value table
- [RepeatableEntry](repeatable-entry.md) — repeats a nested schema per array/JSON/relationship item, card or table layout

## The base Entry API

Every entry type shares this fluent API (defined on `Larafusion\Infolists\Entries\Entry`):

```php
TextEntry::make('title')
    ->label('Post Title')                 // override the auto-generated label
    ->hiddenLabel()                        // hide the label entirely
    ->default('—')                         // shown when state resolves to null
    ->placeholder('Not set')               // shown instead of the raw '—' fallback
    ->hidden(fn ($record) => $record->status === 'draft')
    ->visible(fn ($record) => $record->published_at !== null)
    ->url(fn ($record) => route('posts.show', $record), openInNewTab: true)
    ->tooltip('Extra context for this field')
    ->inlineLabel()                        // label beside the value, not above it
    ->alignment('end')                     // start | center | end | justify
    ->extraAttributes(['data-testid' => 'title-entry'])
    ->extraEntryWrapperAttributes(['class' => 'my-wrapper-class']);
```

### State

By default, an entry's value comes from the record via Laravel's dot-notation
`data_get()` — `TextEntry::make('title')` reads `$record->title`, and
`TextEntry::make('author.name')` reads `$record->author->name`, walking a
to-one relationship (`belongsTo`/`hasOne`/`morphOne`) the same way relationship
table columns already do. `Infolist::getEagerLoadPaths()` collects every
dotted entry name in the tree so `ResourceController::show()` can eager-load
those relationships before resolving state — no N+1 queries.

Override state entirely with a closure:

```php
TextEntry::make('total')->state(fn ($record) => $record->items->sum('price'));
```

`->default($value)` substitutes when the resolved state is `null`.
`->placeholder($text)` controls what the frontend shows when state is empty —
independent of `default()`, since a field can legitimately have no default but
still want friendlier empty-state text than a bare em dash.

### Visibility

`hidden()` and `visible()` accept a bool or a closure evaluated against the
record (with utility injection by parameter name/type — `record`, `entry`).
Hidden entries are dropped from the serialized tree entirely; the frontend
never receives a "hidden" flag to act on, only the entries that should render.

### Labels, tooltips, and inline layout

`label()` accepts a string or closure. `hiddenLabel()` removes the label from
the rendered output while keeping it for internal bookkeeping. `tooltip()`
renders a small info glyph next to the label. `inlineLabel()` renders the
label beside the value on one line instead of stacked above it — set it on an
entry, or on the `Infolist` root or any layout container to cascade a default
down to every descendant entry (an entry's own explicit setting always wins).

### Slots

Eight slots let you inject small pieces of static or record-derived content
around the label and content without writing a custom entry type:
`aboveLabel`, `beforeLabel`, `afterLabel`, `belowLabel`, `aboveContent`,
`beforeContent`, `afterContent`, `belowContent`. Each accepts a string or a
closure resolved against the record — always plain text, never HTML, so
there's nothing here for the client to interpret as executable content.

```php
TextEntry::make('total')
    ->beforeContent('$')
    ->afterLabel(fn ($record) => $record->currency);
```

### Extra HTML attributes

`extraAttributes()` sets attributes on the entry's own content element;
`extraEntryWrapperAttributes()` sets them on the outer wrapper containing both
the label and the content. Both accept a plain array or a closure, and merge
across repeated calls when passed `merge: true`. Only `data-*`, `aria-*`, `id`,
`title`, and a `class` key (merged into the rendered `className`) are honored
by the frontend — `style` is intentionally dropped, since PHP would send it as
a raw CSS string but React requires a style object.

## Layout

Reusable layout components group entries into sections, grids, tabs, and more.
See [Layout](layout.md) for `Section`, `Grid`, `Tabs`, `Fieldset`, `Split`, and
`Group`.

## Serialization and safety

`Infolist::toArray($record)` is the only place resolution happens. It walks
the whole component tree, evaluates every closure against the record
server-side, drops anything hidden for that record, and returns a plain array
of scalars/arrays — no closures, Eloquent models, or query builders ever reach
Inertia. Each entry's payload is assembled through a readonly
`Larafusion\Infolists\Support\EntryConfig` DTO (mirroring the tables package's
`IconColumnConfig` pattern), so there's exactly one place the safe shape is
defined. The React components are purely declarative renderers of that
resolved payload — no business logic, no re-resolution, no client-side state
computation.

## Options (base Entry)

| Method                                                             | Description                                                                                           | Default                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `label(string\|Closure)`                                           | Override the auto-generated label                                                                     | humanized field name                   |
| `hiddenLabel(bool $condition = true)`                              | Hide the label                                                                                        | `false`                                |
| `default(mixed)`                                                   | Value substituted when state resolves to `null`                                                       | —                                      |
| `placeholder(string)`                                              | Frontend empty-state text                                                                             | `—`                                    |
| `state(Closure)`                                                   | Fully override state resolution                                                                       | dot-notation lookup                    |
| `hidden(bool\|Closure)` / `visible(bool\|Closure)`                 | Conditionally drop the entry for a record                                                             | visible                                |
| `url(string\|Closure\|null, bool $openInNewTab = false)`           | Make the value a link                                                                                 | —                                      |
| `openUrlInNewTab(bool $condition = true)`                          | Open the url in a new tab                                                                             | `false`                                |
| `tooltip(string\|Closure\|null)`                                   | Info glyph next to the label                                                                          | —                                      |
| `inlineLabel(bool $condition = true)`                              | Label beside the value instead of above it                                                            | inherited from container, else `false` |
| `alignment(string)`                                                | `start`\|`center`\|`end`\|`justify` (or `alignStart()`/`alignCenter()`/`alignEnd()`/`alignJustify()`) | `start`                                |
| `extraAttributes(array\|Closure, bool $merge = false)`             | Attributes on the content element                                                                     | `[]`                                   |
| `extraEntryWrapperAttributes(array\|Closure, bool $merge = false)` | Attributes on the label+content wrapper                                                               | `[]`                                   |
| `aboveLabel` / `beforeLabel` / `afterLabel` / `belowLabel`         | Slot content around the label                                                                         | —                                      |
| `aboveContent` / `beforeContent` / `afterContent` / `belowContent` | Slot content around the value                                                                         | —                                      |
