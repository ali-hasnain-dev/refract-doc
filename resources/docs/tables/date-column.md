# DateColumn

`Larafusion\Columns\DateColumn` — renders ISO date/datetime values in a human-readable
or relative format.

```php
use Larafusion\Columns\DateColumn;

DateColumn::make('created_at')
    ->label('Joined')
    ->sortable()
    ->since()            // relative: "3 days ago"
    ->format('M j, Y')   // PHP date format (default: 'M j, Y')
    ->dateTime()         // include time: 'M j, Y H:i'
    ->time();            // time only
```

## Options

| Method           | Description                                      |
| ---------------- | ------------------------------------------------ |
| `format(string)` | PHP date format string (default `'M j, Y'`)      |
| `dateTime()`     | Set the format to `'M j, Y H:i'` (date + time)   |
| `time()`         | Show the time portion only                       |
| `since()`        | Show relative time — "3 days ago", "2 hours ago" |

To filter by a date range, add a `DateRangeFilter` — see [Table Filters](filters.md).

Shared base methods (`label`, `sortable`, `hidden`, `align`, `width`, `toggleable`)
are documented in [Tables overview → Common Column Methods](overview.md#common-column-methods).
