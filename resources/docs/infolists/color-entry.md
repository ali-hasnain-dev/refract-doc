# ColorEntry

`Larafusion\Infolists\Entries\ColorEntry` — displays a small color swatch
alongside the raw CSS color value (hex, rgb, rgba, hsl, or hsla), with
optional click-to-copy.

```php
use Larafusion\Infolists\Entries\ColorEntry;

ColorEntry::make('brand_color');

ColorEntry::make('brand_color')
    ->copyable()
    ->copyMessage('Color copied!')
    ->copyMessageDuration(2500);
```

## Supported color formats

The swatch renders when the resolved value is recognized as one of five CSS
color formats — detected **server-side**, so the frontend never has to
parse or validate anything:

| Format | Examples                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| `hex`  | `#ff0000`, `#F00`, `#f00a` (3/4/6/8-digit, with or without alpha)                                                 |
| `rgb`  | `rgb(255, 0, 0)` (legacy comma syntax), `rgb(255 0 0)` / `rgb(255 0 0 / 50%)` (modern space + slash-alpha syntax) |
| `rgba` | `rgba(255, 0, 0, 0.5)`                                                                                            |
| `hsl`  | `hsl(210, 50%, 50%)`, `hsl(210 50% 50%)`, `hsl(210deg 50% 50% / 0.5)`                                             |
| `hsla` | `hsla(210, 50%, 50%, 0.5)`                                                                                        |

Named colors (`red`, `rebeccapurple`, …) and anything else aren't
recognized as one of these five formats. That doesn't mean the value
disappears — it still displays as plain text, just without a color swatch
(a neutral dashed placeholder box shows instead), since Larafusion can't
safely assume an arbitrary string is renderable as a CSS color.

## Copy to clipboard

```php
ColorEntry::make('brand_color')
    ->copyable()
    ->copyMessage('Copied!')     // default: "Copied to clipboard"
    ->copyMessageDuration(3000); // ms
```

Clicking the swatch or value copies the raw CSS string exactly as stored —
no normalization or reformatting. The frontend uses the modern async
Clipboard API (`navigator.clipboard.writeText()`), falling back automatically
to the legacy `document.execCommand('copy')` technique when
`navigator.clipboard` isn't available (non-HTTPS contexts, older browsers,
some embedded webviews) — no extra configuration needed. If both methods
fail, the copy is silently skipped rather than showing a false "copied"
toast.

`copyMessage()`/`copyMessageDuration()` only take effect when `copyable()`
is also enabled — a copy message with nothing wired up to actually copy
doesn't mean anything.

## Tooltips, labels, and placeholders

Every shared [base Entry](overview.md#options-base-entry) feature works —
`label()`, `placeholder()`, `tooltip()`, `default()`, `hidden()`/`visible()`,
`inlineLabel()`, `alignment()`, and the slots:

```php
ColorEntry::make('brand_color')
    ->label('Brand Color')
    ->placeholder('No color set')
    ->default('#7c3aed')
    ->tooltip('The primary brand accent color');
```

`default()` and `state()` overrides are resolved through the same format
detector as a real attribute value, so a fallback color still gets its
swatch.

## Accessibility

The swatch is `aria-hidden` (purely decorative — the adjacent value text
already conveys the color). When `copyable()` is enabled, the whole control
gets `role="button"`, `tabIndex={0}`, and a descriptive `aria-label`
("Copy color value #ff0000 to clipboard") so screen readers announce the
action clearly rather than just the raw hex string; it's activatable via
both <kbd>Enter</kbd> and <kbd>Space</kbd>.

## Options

| Method                                   | Description                                 | Default               |
| ---------------------------------------- | ------------------------------------------- | --------------------- |
| `copyable(bool $condition = true)`       | Enable click-to-copy                        | `false`               |
| `copyMessage(string)`                    | Toast message shown after a successful copy | "Copied to clipboard" |
| `copyMessageDuration(int $milliseconds)` | How long the copy toast stays visible       | app default           |

Plus every method on the [base Entry API](overview.md#options-base-entry).

## How it's serialized

`ColorEntry::toArray()` never sends a closure, model, or query object to the
client. The resolved value is run through
`Larafusion\Infolists\Support\ColorFormatDetector` server-side, and only the
detected format name (`hex`/`rgb`/`rgba`/`hsl`/`hsla`, or omitted entirely
when unrecognized) is serialized as metadata alongside the raw color string
in `state` — the frontend never re-parses or re-validates the color itself.
The final payload is assembled through two focused readonly DTOs —
`Larafusion\Infolists\Support\ColorMetadataConfig` (the detected `format`)
and `Larafusion\Infolists\Support\CopyConfig` (`copyable`/`copyMessage`/
`copyMessageDuration`, shared with `TextEntry`) — composed by
`ColorEntryConfig`, mirroring `TextEntryConfig`'s/`IconEntryConfig`'s/
`ImageEntryConfig`'s composition pattern. The React `ColorEntryView`
component is purely presentational: it renders a swatch only when `format`
is present, and performs the actual clipboard write client-side, with no
server round trip and no re-resolution of any business logic.
