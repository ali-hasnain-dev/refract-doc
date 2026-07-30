# IconEntry

`Larafusion\Infolists\Entries\IconEntry` — displays a lucide icon (or a stack
of icons, for an array state) resolved from the entry's value. Use it for
enum-backed status/type indicators, boolean check/x indicators, or any entry
where an icon communicates the value faster than a word does. Mirrors
`IconColumn`'s resolution algorithm exactly — the same value → icon/color
lookup, evaluated against the row's raw state client-side.

```php
use Larafusion\Infolists\Entries\IconEntry;

// Boolean mode — auto check/x icons in semantic colors
IconEntry::make('is_featured')->boolean();

// Value → icon mapping, with an optional color map and a fallback icon
IconEntry::make('type')
    ->icon('file')                      // fallback for unmapped values
    ->icons([
        'article' => 'file-text',
        'video'   => 'play-circle',
        'podcast' => 'mic',
    ])
    ->colors([
        'article' => 'primary',
        'video'   => 'success',
        'podcast' => 'warning',
    ]);
```

## Setting the icon

`icon()` sets a single fallback icon shown for any value that has no entry in
`icons()` (ignored in boolean mode). `icons()` maps specific values to
specific icons — this is what actually makes the icon _dynamic_ per record,
since the frontend looks the record's raw value up in this map at render
time.

```php
IconEntry::make('type')
    ->icon('circle')                    // shown for anything not listed below
    ->icons([
        'article' => 'file-text',
        'video'   => 'play-circle',
    ]);
```

`icon()` accepts a closure instead of a literal string, resolved **against
the record** at serialization time — with Filament-style utility injection
by parameter name/type (`record`, `entry`, `name`):

```php
IconEntry::make('type')->icon(fn ($record) => $record->is_pinned ? 'pin' : 'circle');
```

`icons()` (the value → icon lookup table) always stays a static map — it's
looked up client-side against each record's own raw state, independent of
the record itself, exactly like `IconColumn`.

## Customizing the icon color

`color()` mirrors `IconColumn`'s Filament-style API and has three shapes,
plus a `colors()` shortcut for a direct `value => color` map. Only the
single-fallback shape accepts a closure (resolved against the record) — the
mapping shapes always take a literal color name, since they populate the
same kind of static lookup table `icons()` does:

```php
IconEntry::make('type')
    ->color('gray')                                   // fallback for every unmapped value — accepts a closure
    ->color('success', 'published')                    // map one value (or several) to a literal color
    ->color(['danger' => ['archived', 'deleted']])     // bulk color => values map

// or, directly:
IconEntry::make('type')->colors(['published' => 'success', 'archived' => 'danger']);
```

Color tokens: `primary` · `success` · `warning` · `danger` · `info` · `gray`.

## Customizing the icon size

```php
IconEntry::make('type')->size('lg');

// Record-aware, like every other closure-accepting setter here:
IconEntry::make('type')->size(fn ($record) => $record->is_pinned ? 'lg' : 'md');
```

Size tokens: `xs` · `sm` · `md` (default) · `lg` · `xl`. A raw Tailwind size
class (e.g. `w-8 h-8`) is also accepted for one-off cases.

## Boolean rendering

`boolean()` renders a `check-circle`/`x-circle` icon in `success`/`danger` by
default. Override any of the four pieces independently — you don't have to
replace all of them at once — and every one of them accepts a closure
resolved against the record:

```php
IconEntry::make('is_active')
    ->boolean()
    ->trueIcon('shield-check')     // default: check-circle
    ->falseIcon('shield-x')        // default: x-circle
    ->trueColor('primary')         // default: success
    ->falseColor('gray');          // default: danger

// The condition itself can be a closure too, not just the underlying attribute:
IconEntry::make('reviewed')->boolean(fn ($record) => $record->reviewed_at !== null);

// Colors can depend on other fields on the same record:
IconEntry::make('is_active')
    ->boolean()
    ->trueColor(fn ($record) => $record->is_flagged ? 'warning' : 'success');
```

A `null` value renders nothing — the entry's `placeholder()` (or the default
em dash) takes over, exactly like every other entry — unless you supply a
`default()`: `->boolean()->default(false)` treats a `null` database value the
same as `false`. Truthy database representations (`true`, `1`, `'1'`,
`'true'`) are all recognized.

## Rendering multiple icons

If the record's raw value is an array (for example a JSON column of tags or
badges), `IconEntry` automatically renders one icon per entry — no extra
configuration needed. Each entry is resolved independently through the same
`icons()`/`colors()` maps and `icon()`/`color()` fallbacks:

```php
IconEntry::make('badges')->icons([
    'featured' => 'star',
    'new'      => 'sparkles',
    'sale'     => 'tag',
]);
// $record->badges === ['featured', 'new'] renders a star + a sparkles icon
```

Use `wrap()` to let a long stack of icons wrap onto a new line instead of
staying on one row (useful for narrow layouts with many entries):

```php
IconEntry::make('badges')->icons([...])->wrap();
```

## Tooltips, labels, and placeholders

Every shared [base Entry](overview.md#options-base-entry) feature works —
`label()`, `hiddenLabel()`, `placeholder()`, `tooltip()`, `hidden()`/
`visible()`, `url()`, `inlineLabel()`, `alignment()`, and the slots. The
entry's `tooltip()` is shown both near the label (like any entry) and as a
native browser tooltip directly on the icon glyph itself — useful since an
icon alone often doesn't convey as much as text does:

```php
IconEntry::make('is_verified')->boolean()->tooltip('Identity verified');
```

## Accessibility

Every rendered icon carries `role="img"` and an `aria-label` — the resolved
tooltip text isn't required for this; the label defaults to `Yes`/`No` in
boolean mode or the raw value/icon name otherwise — so screen readers
announce something meaningful even though the entry has no visible text.

## Options

| Method                                                       | Description                                                                                                       | Default                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `icon(string\|Closure\|null)`                                | Fallback icon for unmapped values (ignored in boolean mode)                                                       | —                           |
| `icons(array $map)`                                          | Map `value => lucide icon name`; repeated calls merge; always static                                              | `[]`                        |
| `color(string\|array\|Closure, $values = null)`              | Filament-style: one fallback color (accepts a closure), `color($color, $values)`, or `color([$color => $values])` | —                           |
| `colors(array $map)`                                         | Map `value => color name` directly; repeated calls merge; always static                                           | `[]`                        |
| `size(string\|Closure)`                                      | `xs`\|`sm`\|`md`\|`lg`\|`xl`, or a raw size class                                                                 | `md`                        |
| `boolean(bool\|Closure $condition = true)`                   | Render as a boolean indicator                                                                                     | `false`                     |
| `trueIcon(string\|Closure)` / `falseIcon(string\|Closure)`   | Icon when boolean state is true / false                                                                           | `check-circle` / `x-circle` |
| `trueColor(string\|Closure)` / `falseColor(string\|Closure)` | Color when boolean state is true / false                                                                          | `success` / `danger`        |
| `wrap(bool $condition = true)`                               | Let multiple icons wrap onto a new line                                                                           | `false`                     |

Plus every method on the [base Entry API](overview.md#options-base-entry) —
`default()`/`placeholder()` still apply to the underlying value, `tooltip()`
renders on both the label and the glyph itself.

## How it's serialized

`IconEntry::toArray()` never sends a closure, model, or query object to the
client. Every closure passed to `icon()`/`color()`/`size()`/`boolean()`/
`trueIcon()`/`falseIcon()`/`trueColor()`/`falseColor()` is evaluated
**against the actual record**, server-side, at serialization time — with
utility injection by parameter name/type (`record`, `entry`, `name`) — and
only the resulting scalar is serialized. The final payload is assembled
through three focused readonly DTOs — `Larafusion\Infolists\Support\IconValueMapConfig`
(the `icon`/`icons`/`color`/`colors` value-map), `IconBooleanConfig` (the
`boolean`/`trueIcon`/`falseIcon`/`trueColor`/`falseColor` group, always fully
present in the payload), and `IconStyleConfig` (`size`/`wrap`) — composed by
`IconEntryConfig`, mirroring the tables package's `IconColumnConfig` pattern.
The React `IconEntryView` component is purely presentational — it resolves
the icon, color, and tooltip for a record entirely from that static config
plus the record's own already-resolved `state`, with no server round trip
and no re-evaluation of any business logic.
