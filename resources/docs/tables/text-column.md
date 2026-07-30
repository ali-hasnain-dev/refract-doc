# TextColumn

`Larafusion\Columns\TextColumn` — the most versatile column. Renders plain text with
optional truncation, badges, copy buttons, money formatting, prefixes/suffixes, and
enum label mapping.

```php
use Larafusion\Columns\TextColumn;

TextColumn::make('title')
    ->label('Post Title')
    ->sortable()
    ->searchable()                  // include in the global search box
    ->limit(80)                     // truncate to 80 characters
    ->wrap()                        // allow text to wrap across lines
    ->lineClamp(2)                  // CSS line-clamp (sets limit = 2 lines)
    ->description('Short summary')  // second, smaller line below the value
    ->copyable()                    // click-to-copy button
    ->color('primary')              // static semantic color
    ->weight('bold')                // 'bold' | 'semibold' | 'medium'
    ->bold()                        // shortcut for ->weight('bold')
    ->prefix('$')
    ->suffix(' USD')
    ->money('USD')                  // format as currency
    ->asBadge();                    // render as an inline badge chip
```

## Enum integration

`->enum(string $enumClass)` enables badge rendering and populates labels and colors
from the enum's `HasLabel` / `HasColor` interfaces:

```php
TextColumn::make('status')->enum(PostStatus::class);
// Badge chip; label from HasLabel::getLabel(), color from HasColor::getColor()
```

To filter by the value, add a `SelectFilter` to the table's filters array — see
[Table Filters](filters.md).

## Options

| Method                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `limit(int)`          | Truncate to N characters                       |
| `wrap()`              | Allow text to wrap across lines                |
| `lineClamp(int)`      | CSS line-clamp after N lines                   |
| `description(string)` | Secondary text below the main value            |
| `copyable()`          | Show a copy-to-clipboard button                |
| `color(string)`       | Semantic color (`primary`, `success`, …)       |
| `weight(string)`      | Font weight — `bold` \| `semibold` \| `medium` |
| `bold()`              | Shortcut for `weight('bold')`                  |
| `prefix(string)`      | Decorative prefix (not stored)                 |
| `suffix(string)`      | Decorative suffix (not stored)                 |
| `money(?string)`      | Format as currency; defaults to USD            |
| `asBadge()`           | Render as an inline badge chip                 |
| `enum(class-string)`  | Bind a BackedEnum for label + color            |

Shared base methods (`label`, `sortable`, `searchable`, `hidden`, `align`, `width`,
`toggleable`) are documented in [Tables overview → Common Column Methods](overview.md#common-column-methods).
