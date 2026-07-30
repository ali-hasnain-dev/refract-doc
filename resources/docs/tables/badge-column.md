# BadgeColumn

`Larafusion\Columns\BadgeColumn` — renders values as coloured pill badges. Map values
to named colors and icons explicitly, or populate everything from a BackedEnum.

```php
use Larafusion\Columns\BadgeColumn;

// Map a whole color → values dictionary
BadgeColumn::make('status')
    ->colors([
        'success' => 'published',
        'warning' => 'draft',
        'danger'  => ['archived', 'deleted'],
        'info'    => 'reviewing',
    ])
    ->icons([
        'published' => 'check-circle',
        'archived'  => 'archive',
    ])
    ->labels([
        'published' => 'Published',
        'archived'  => 'Archived',
    ]);

// Map a single value at a time
BadgeColumn::make('role')
    ->color('primary', 'admin')
    ->color('success', 'editor');

// Populate labels, colors, and icons from an enum
BadgeColumn::make('status')->enum(OrderStatus::class);
```

Color tokens: `primary` · `success` · `warning` · `danger` · `info` · `gray`.

To filter by the value, add a `SelectFilter` (it can take the same enum) — see
[Table Filters](filters.md).

## Options

| Method                                        | Description                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `color(string $color, string\|array $values)` | Map one value (or several) to a color                                                |
| `colors(array $map)`                          | Map a `color => values` dictionary at once                                           |
| `icons(array $map)`                           | Map `value => lucide icon name`                                                      |
| `labels(array $map)`                          | Map `value => display label`                                                         |
| `enum(class-string)`                          | Populate labels/colors/icons from a BackedEnum (`HasLabel` / `HasColor` / `HasIcon`) |

Shared base methods (`label`, `sortable`, `hidden`, `align`, `width`, `toggleable`)
are documented in [Tables overview → Common Column Methods](overview.md#common-column-methods).
