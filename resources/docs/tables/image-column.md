# ImageColumn

`Larafusion\Columns\ImageColumn` — renders an image from a file path stored on the
record. Ideal for avatars and thumbnails.

```php
use Larafusion\Columns\ImageColumn;

ImageColumn::make('avatar')
    ->circular()        // round crop (vs. rounded-lg)
    ->size('2.5rem')    // CSS size (width = height)
    ->disk('public')    // storage disk (default: 'public')
    ->stacked(3);       // overlapping avatars, show up to N
```

## Options

| Method         | Description                                                   | Default    |
| -------------- | ------------------------------------------------------------- | ---------- |
| `circular()`   | Round crop instead of rounded corners                         | rounded-lg |
| `size(string)` | CSS width/height                                              | `2.5rem`   |
| `disk(string)` | Storage disk used to build the URL                            | `public`   |
| `stacked(int)` | Overlap multiple images, showing up to N with a `+N` overflow | —          |

The `disk` value is passed to the frontend so it can build the correct URL. For
`stacked`, the first N images overlap in a row and any excess is shown as "+N".

Shared base methods (`label`, `hidden`, `align`, `width`, `toggleable`) are documented
in [Tables overview → Common Column Methods](overview.md#common-column-methods).
