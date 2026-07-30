# BooleanColumn

`Larafusion\Columns\BooleanColumn` — renders a boolean value as an icon in a semantic
color, with optional tooltips.

```php
use Larafusion\Columns\BooleanColumn;

BooleanColumn::make('is_active')
    ->label('Active')
    ->trueColor('success')      // default: 'success'
    ->falseColor('danger')      // default: 'danger'
    ->trueLabel('Yes')          // tooltip text (default: 'Yes')
    ->falseLabel('No')          // tooltip text (default: 'No')
    ->trueIcon('check-circle')  // lucide icon (default: 'check-circle')
    ->falseIcon('x-circle');    // lucide icon (default: 'x-circle')
```

## Options

| Method               | Description                   | Default        |
| -------------------- | ----------------------------- | -------------- |
| `trueColor(string)`  | Color when the value is true  | `success`      |
| `falseColor(string)` | Color when the value is false | `danger`       |
| `trueIcon(string)`   | Lucide icon when true         | `check-circle` |
| `falseIcon(string)`  | Lucide icon when false        | `x-circle`     |
| `trueLabel(string)`  | Tooltip when true             | `Yes`          |
| `falseLabel(string)` | Tooltip when false            | `No`           |

Color tokens: `primary` · `success` · `warning` · `danger` · `info` · `gray`.

To filter by the value, add a `TernaryFilter` (All / Yes / No) — see
[Table Filters](filters.md).

Shared base methods (`label`, `sortable`, `hidden`, `align`, `width`, `toggleable`)
are documented in [Tables overview → Common Column Methods](overview.md#common-column-methods).
