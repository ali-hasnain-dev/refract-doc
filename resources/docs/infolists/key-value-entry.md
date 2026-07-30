# KeyValueEntry

`Larafusion\Infolists\Entries\KeyValueEntry` — displays a one-dimensional
associative array (or JSON object) as a clean, two-column key/value table.

```php
use Larafusion\Infolists\Entries\KeyValueEntry;

KeyValueEntry::make('meta');

KeyValueEntry::make('settings')
    ->keyLabel('Setting')
    ->valueLabel('Current value')
    ->placeholder('No settings configured');
```

## What it accepts

`KeyValueEntry` resolves its value the same way every entry does (dot-notation
attribute lookup, `->default()`, `->state(Closure)`), then normalizes the
result:

- A plain PHP associative array — including an Eloquent `array`/`json` cast
  column — is used as-is.
- A raw JSON-string column (no cast defined) is `json_decode`d automatically.
- The result of a `->state(fn () => [...])` closure is normalized the same
  way as a real attribute.

Anything that isn't a non-empty associative array after that — `null`, an
empty array, a sequential/list array (`['a', 'b', 'c']`), or a string that
isn't valid JSON — is treated as **no data**: the entry renders its
`placeholder()` (falling back to an em dash), exactly like an empty value on
any other entry. Nothing throws.

```php
KeyValueEntry::make('meta'); // Eloquent array cast, e.g. protected $casts = ['meta' => 'array'];
KeyValueEntry::make('raw_json_column'); // a plain string column containing '{"a":1}'
KeyValueEntry::make('computed')->state(fn ($record) => $record->settings->toArray());
```

> **Known edge case:** PHP normalizes purely-numeric string keys (`"0"`,
> `"1"`, …) to real integer keys when decoding JSON. An object whose keys
> happen to be sequential integers starting at `0` is therefore
> indistinguishable from a JSON array and is treated as empty, the same as
> any other sequential list. This only affects the unusual case of an object
> with literal numeric-string keys in that exact order.

## Column labels

```php
KeyValueEntry::make('meta')->keyLabel('Field')->valueLabel('Data');
KeyValueEntry::make('meta')->keyLabel(fn ($record) => $record->schema_label);
```

Default column headers are `"Key"` and `"Value"`. Both accept a closure,
resolved against the record like every other entry setter.

## Values

Every value is stringified server-side before it ever reaches the frontend:

| PHP value             | Rendered as                                                   |
| --------------------- | ------------------------------------------------------------- |
| string / int / float  | itself                                                        |
| `true` / `false`      | `"true"` / `"false"`                                          |
| `null`                | a distinct, dimmed _"null"_ placeholder — not an empty string |
| a nested array/object | a JSON-encoded fallback string (see below)                    |

`KeyValueEntry` is documented and intended for **one-dimensional** data — a
nested array as a value is outside that contract, but rather than crash or
silently drop the row, it's shown as its JSON-encoded representation so no
data is ever lost.

Long values wrap onto multiple lines instead of overflowing; the table
itself scrolls horizontally as a last resort on very narrow viewports.

## Copy to clipboard

Every non-null value gets a small copy icon (visible on hover/focus) that
copies that row's raw value to the clipboard, using the modern Clipboard API
with an automatic `document.execCommand('copy')` fallback — the same
mechanism used everywhere else in the Infolist system. This is a built-in,
always-available convenience for this entry rather than something toggled
via a fluent method — there's no `copyable()`/`copyMessage()` API here,
unlike `TextEntry`/`ColorEntry`/`CodeEntry`.

## Tooltips, labels, and placeholders

Every shared [base Entry](overview.md#options-base-entry) feature works —
`label()`, `placeholder()`, `tooltip()`, `default()`, `hidden()`/`visible()`,
`inlineLabel()`, `alignment()`, and the slots:

```php
KeyValueEntry::make('meta')
    ->label('Metadata')
    ->placeholder('No metadata recorded')
    ->default(['status' => 'not set'])
    ->tooltip('Arbitrary key/value data attached to this record');
```

## Accessibility

Rendered as a real, semantic `<table>` with `<th scope="col">` column
headers, so assistive technology announces row/column structure correctly.
The per-value copy control has `role="button"`, `tabIndex={0}`, and a
descriptive `aria-label` ("Copy value for {key}"), activatable via both
<kbd>Enter</kbd> and <kbd>Space</kbd>.

## Options

| Method                        | Description                     | Default   |
| ----------------------------- | ------------------------------- | --------- |
| `keyLabel(string\|Closure)`   | The key column's header label   | `"Key"`   |
| `valueLabel(string\|Closure)` | The value column's header label | `"Value"` |

Plus every method on the [base Entry API](overview.md#options-base-entry).

## How it's serialized

`KeyValueEntry::toArray()` never sends a closure, model, or query object to
the client. The resolved array is normalized and stringified entirely
server-side, then assembled through two focused readonly DTOs —
`Larafusion\Infolists\Support\KeyValueItemConfig` (one `{key, value}` pair)
and `Larafusion\Infolists\Support\KeyValueLabelConfig` (`keyLabel`/
`valueLabel`) — composed by `KeyValueEntryConfig`, mirroring every other
entry's config DTO composition pattern. `state` holds the same ordered list
of pairs (or `null` when there's nothing valid to show — the signal
`EntryWrapper` uses for the generic placeholder, identical to every other
entry type). The React `KeyValueEntryView` component is purely
presentational: every value renders as plain text (React escapes it
automatically — there is no `dangerouslySetInnerHTML` anywhere in this
entry), and the clipboard write happens entirely client-side.
