# IconColumn

`Larafusion\Columns\IconColumn` — a display-only column that renders a lucide icon
(or a stack of icons) instead of raw text. Use it for enum-backed status/type
columns, boolean check/x indicators, or any column where an icon communicates the
value faster than a word does.

```php
use Larafusion\Columns\IconColumn;

// Boolean mode — auto check/x icons in semantic colors
IconColumn::make('is_featured')->boolean();

// Value → icon mapping, with an optional color map and a fallback icon
IconColumn::make('type')
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
`icons()` (ignored in boolean mode). `icons()` maps specific values to specific
icons — this is what actually makes the icon _dynamic_ per row, since the
frontend looks the record's raw value up in this map at render time.

```php
IconColumn::make('type')
    ->icon('circle')                    // shown for anything not listed below
    ->icons([
        'article' => 'file-text',
        'video'   => 'play-circle',
    ]);
```

Both accept a closure instead of a literal string. The closure is evaluated
**once, immediately**, with Filament-style utility injection by parameter
name/type — `column` resolves to the `IconColumn` instance itself, `name` to
the column's attribute name:

```php
IconColumn::make('type')->icon(fn (IconColumn $column) => config('app.default_type_icon'));
```

> A column definition is serialized once per request, independent of any single
> record, so these closures cannot see per-row data — there is no `$record`
> utility to inject. For genuinely value-dependent icons, use `icons()` (the
> lookup happens client-side against each row's own value, which is exactly
> how the boolean/badge columns already behave in this table implementation).

## Customizing the icon color

`color()` mirrors `BadgeColumn`'s Filament-style API and has three shapes, plus
a `colors()` shortcut for a direct `value => color` map:

```php
IconColumn::make('type')
    ->color('gray')                                   // one fallback color for every value
    ->color('success', 'published')                    // map one value (or several) to a color
    ->color(['danger' => ['archived', 'deleted']])     // bulk color => values map

// or, directly:
IconColumn::make('type')->colors(['published' => 'success', 'archived' => 'danger']);
```

Color tokens: `primary` · `success` · `warning` · `danger` · `info` · `gray`.

## Customizing the icon size

```php
IconColumn::make('type')->size('lg');
```

Size tokens: `xs` · `sm` · `md` (default) · `lg` · `xl`. A raw Tailwind size class
(e.g. `w-8 h-8`) is also accepted for one-off cases.

## Boolean rendering

`boolean()` renders a `check-circle`/`x-circle` icon in `success`/`danger` by
default. Override any of the four pieces independently — you don't have to
replace all of them at once:

```php
IconColumn::make('is_active')
    ->boolean()
    ->trueIcon('shield-check')     // default: check-circle
    ->falseIcon('shield-x')        // default: x-circle
    ->trueColor('primary')         // default: success
    ->falseColor('gray');          // default: danger
```

A `null` value renders as a neutral placeholder (`—`) unless you supply a
`default()` — `->boolean()->default(false)` treats a `null` database value the
same as `false`. Truthy database representations (`true`, `1`, `'1'`, `'true'`)
are all recognized.

## Rendering multiple icons

If the record's raw value is an array (for example a JSON column of tags or
badges), `IconColumn` automatically renders one icon per entry — no extra
configuration needed. Each entry is resolved independently through the same
`icons()`/`colors()` maps and `icon()`/`color()` fallbacks:

```php
IconColumn::make('badges')->icons([
    'featured' => 'star',
    'new'      => 'sparkles',
    'sale'     => 'tag',
]);
// $record->badges === ['featured', 'new'] renders a star + a sparkles icon
```

Use `wrap()` to let a long stack of icons wrap onto a new line instead of
staying on one row (useful for narrow columns with many entries):

```php
IconColumn::make('badges')->icons([...])->wrap();
```

## Adding a tooltip

`tooltip()` accepts a single string shown on every cell, or a `value => tooltip`
map for per-value text (also honored per-entry in multiple-icon mode):

```php
IconColumn::make('is_verified')->boolean()->tooltip('Identity verified');

IconColumn::make('status')->tooltip([
    'published' => 'Visible to everyone',
    'draft'     => 'Only visible to editors',
]);
```

## Accessibility

Every rendered icon carries `role="img"` and an `aria-label` — the resolved
tooltip text when one is set, otherwise `Yes`/`No` in boolean mode or the raw
value/icon name otherwise — so screen readers announce something meaningful
even though the column has no visible text.

## Options

| Method                                                       | Description                                                                                   | Default                     |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------- |
| `icon(string\|Closure\|null)`                                | Fallback icon for unmapped values (ignored in boolean mode)                                   | —                           |
| `icons(array $map)`                                          | Map `value => lucide icon name`; repeated calls merge                                         | `[]`                        |
| `color(string\|array\|Closure, $values = null)`              | Filament-style: one fallback color, `color($color, $values)`, or `color([$color => $values])` | —                           |
| `colors(array $map)`                                         | Map `value => color name` directly; repeated calls merge                                      | `[]`                        |
| `size(string\|Closure)`                                      | `xs`\|`sm`\|`md`\|`lg`\|`xl`, or a raw size class                                             | `md`                        |
| `boolean(bool\|Closure $condition = true)`                   | Render as a boolean indicator                                                                 | `false`                     |
| `trueIcon(string\|Closure)` / `falseIcon(string\|Closure)`   | Icon when boolean state is true / false                                                       | `check-circle` / `x-circle` |
| `trueColor(string\|Closure)` / `falseColor(string\|Closure)` | Color when boolean state is true / false                                                      | `success` / `danger`        |
| `default(mixed)`                                             | Value substituted when the record's raw state is `null`                                       | —                           |
| `tooltip(string\|array\|Closure\|null)`                      | A single tooltip, or a `value => tooltip` map                                                 | —                           |
| `wrap(bool $condition = true)`                               | Let multiple icons wrap onto a new line                                                       | `false`                     |

Shared base methods (`label`, `sortable`, `hidden`, `align`, `width`, `toggleable`)
are documented in [Tables overview → Common Column Methods](overview.md#common-column-methods).

## How it's serialized

`IconColumn::toArray()` never sends a closure, model, or query object to the
client — every closure passed to `icon()`/`color()`/`size()`/`boolean()`/
`default()`/`tooltip()` is evaluated immediately, server-side, and only the
resulting scalar/array is serialized (see `Larafusion\Columns\Support\IconColumnConfig`,
mirrored on the frontend by the `IconColumnConfig` TypeScript type). The React
`IconColumnCell` component is purely presentational — it resolves the icon,
color, and tooltip for a row entirely from that static config plus the row's
own raw value, with no server round trip.
