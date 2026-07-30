# TextEntry

`Larafusion\Infolists\Entries\TextEntry` — the default, most common entry type.
Displays a scalar value (or a list of values) as text, with a full
Filament-parity feature set: colors, icons, badges, custom formatting, date/
time display, numeric/money formatting, markdown and sanitized-HTML
rendering, list layout, relationship aggregation, typography, truncation,
copy-to-clipboard, and prefix/suffix (with optional clickable affix icons).

```php
use Larafusion\Infolists\Entries\TextEntry;

TextEntry::make('title');

TextEntry::make('status')->badge()->color('success');

TextEntry::make('price')->money('USD');

TextEntry::make('created_at')->since()->dateTimeTooltip();
```

Every value-transforming feature — `formatStateUsing()`, date/time display,
numeric/money formatting, markdown→HTML conversion, HTML sanitization, and
relationship aggregation — resolves entirely server-side. `state` always
arrives at the frontend in its final display form; the React component never
re-parses dates, re-computes aggregates, or re-formats numbers. Presentational
config (color, icon, badge, typography, list layout, copy behavior) is
static/closure-resolved and serialized alongside it.

## Formatting text

### Custom formatting

`formatStateUsing()` fully overrides how the resolved state is displayed.
The closure receives `record`/`entry`/`state` by parameter name (or type),
and its return value replaces the state entirely — it takes priority over
every other formatter below when combined:

```php
TextEntry::make('amount')->formatStateUsing(
    fn (string $state, $record) => "{$record->currency} " . number_format((float) $state, 2),
);
```

### Dates

```php
TextEntry::make('created_at')->date();          // "Jan 15, 2024"
TextEntry::make('created_at')->dateTime();       // "Jan 15, 2024 10:30"
TextEntry::make('created_at')->time();           // "10:30"
TextEntry::make('created_at')->since();          // "3 days ago"

TextEntry::make('created_at')->isoDate();        // "2024-01-15"
TextEntry::make('created_at')->isoDateTime();    // "2024-01-15T10:30:00+00:00"
TextEntry::make('created_at')->isoTime();        // "10:30:00"
```

`date()`/`dateTime()`/`time()` accept an optional custom format string
(Carbon's `translatedFormat()`):

```php
TextEntry::make('created_at')->date('Y/m/d');
```

Every mode has a matching `*Tooltip()` variant that shows the complementary
representation on hover, reusing the entry's tooltip:

```php
TextEntry::make('created_at')->since()->dateTimeTooltip();      // relative display, exact time on hover
TextEntry::make('created_at')->dateTime()->sinceTooltip();      // exact display, relative time on hover
TextEntry::make('created_at')->isoDateTime()->isoDateTimeTooltip();
```

`timezone()` applies to both the main display and the tooltip:

```php
TextEntry::make('created_at')->dateTime()->timezone('America/New_York');
```

### Numbers and money

```php
TextEntry::make('views')->numeric();                              // "1,234"
TextEntry::make('views')->numeric(decimalPlaces: 2);               // "1,234.00"
TextEntry::make('views')->numeric(2, decimalSeparator: ',', thousandsSeparator: '.'); // "1.234,00"

TextEntry::make('price')->money();                // USD, 2 decimal places — "$1,234.50"
TextEntry::make('price')->money('EUR');            // "€1,234.50"
TextEntry::make('price')->money('EUR', decimalPlaces: 0); // "€1,235"
```

Currency symbols come from a small built-in map (USD, EUR, GBP, JPY, INR,
CNY, KRW, RUB, BRL, CHF, CAD, AUD, PKR); an unmapped ISO code falls back to a
`"1,234.50 XYZ"`-style suffix. No `ext-intl`/`NumberFormatter` dependency.

### Markdown and HTML

```php
TextEntry::make('body')->markdown();  // Markdown source → sanitized HTML
TextEntry::make('body')->html();      // Treat the value as HTML directly, sanitized the same way
```

Both modes pass through the same allow-list HTML sanitizer before the value
ever leaves the server — `<script>`/`<style>` blocks are dropped entirely,
every attribute is stripped except a scheme-checked `href` on `<a>`
(`javascript:`/`data:` URIs are blocked), and only a small set of inline/
block tags survive (`p`, `br`, `strong`, `b`, `em`, `i`, `u`, `s`, `small`,
`span`, `code`, `pre`, `blockquote`, `ul`, `ol`, `li`, `h1`–`h6`, `a`).
**There is no way to disable sanitization** — an admin panel package that
ships to many Laravel apps cannot offer a "trust me" raw-HTML escape hatch
without becoming a stored-XSS vector the moment any field holds
user-submitted content.

The bundled markdown converter covers the common subset admin content
actually uses (headings, bold/italic/strikethrough, inline code, links,
blockquotes, ordered/unordered lists) — not full CommonMark compliance.

### Lists

When the underlying value is an array (a JSON column, a plucked relation,
etc.), every item is resolved and formatted independently through the exact
same pipeline above, then laid out according to:

```php
TextEntry::make('tags')->bulleted();                          // • one  • two  • three
TextEntry::make('tags')->listWithLineBreaks();                // one\ntwo\nthree
TextEntry::make('tags')->separator(' | ');                    // one | two | three (default: ', ')
TextEntry::make('tags')->limitList(3);                        // show 3, "+N more" for the rest
TextEntry::make('tags')->limitList(3)->expandableLimitedList(); // "+N more" expands in place
```

### Truncation, wrapping, and line clamping

```php
TextEntry::make('excerpt')->limit(100);   // truncate by character count, with an ellipsis
TextEntry::make('excerpt')->words(20);    // truncate by word count instead
TextEntry::make('excerpt')->lineClamp(3); // CSS-clamp to 3 lines, independent of limit()/words()
TextEntry::make('excerpt')->wrap();       // allow wrapping instead of a single truncated line
```

`limit()`/`words()` are skipped automatically for markdown()/html() state —
slicing raw HTML by character count would break tags; `lineClamp()` (pure
CSS, doesn't touch content) still applies safely.

## Colors and icons

```php
TextEntry::make('status')->color('success');
TextEntry::make('status')->color(fn ($record) => $record->is_flagged ? 'danger' : 'gray');

TextEntry::make('status')
    ->icon(fn ($record) => $record->status === 'published' ? 'check-circle' : 'circle')
    ->iconColor('success')
    ->iconPosition('after'); // default: 'before'
```

Color tokens: `primary` · `success` · `warning` · `danger` · `info` · `gray`.
Every color/icon setter accepts a closure resolved against the record (with
utility injection by parameter name/type — `record`, `entry`).

## Badges

```php
TextEntry::make('status')->badge()->color('success');

TextEntry::make('status')->enum(PostStatus::class); // badge() + labels/colors from HasLabel/HasColor
```

## Typography

```php
TextEntry::make('title')
    ->size('lg')          // xs | sm | base | lg | xl
    ->weight('semibold')  // thin|light|normal|medium|semibold|bold|extrabold|black
    ->fontFamily('mono'); // sans | serif | mono
```

## Prefix, suffix, and affix actions

```php
use Larafusion\Infolists\Support\EntryAction;

TextEntry::make('amount')
    ->prefix('$')
    ->suffix(fn ($record) => " {$record->currency}");

TextEntry::make('repo_url')
    ->suffixAction(
        EntryAction::make('external-link')
            ->color('gray')
            ->tooltip('Open repository')
            ->url(fn ($record) => $record->repo_url, openInNewTab: true),
    );
```

`prefixAction()`/`suffixAction()` render a small clickable icon beside the
value. `EntryAction` is scoped to URL navigation — Larafusion's infolists
package doesn't have a general action-execution framework the way the
tables package does; `Larafusion\Tables\Actions\Action` remains the place
for anything richer (server callbacks, confirmation dialogs, etc.).

## Copy to clipboard

```php
TextEntry::make('api_key')
    ->copyable()
    ->copyMessage('API key copied!')  // default: "Copied to clipboard"
    ->copyMessageDuration(3000);       // ms; matches the app's default toast duration if omitted
```

## Relationship aggregation

`avg()`/`min()`/`max()`/`sum()` aggregate a column across a relationship —
computed from the relationship's loaded Collection (no extra aggregate
query), so the relationship is automatically added to the eager-load list
`ResourceController::show()` resolves before rendering, exactly like
relationship dot-notation entries:

```php
TextEntry::make('average_rating')->avg('reviews', 'rating')->numeric(1);
TextEntry::make('total_revenue')->sum('orders', 'total')->money();
TextEntry::make('lowest_price')->min('variants', 'price')->money();
TextEntry::make('highest_price')->max('variants', 'price')->money();
```

An explicit `->state(fn () => ...)` override, if also set, still takes
priority over aggregation — it's the most specific thing a developer can
configure.

## Options

| Method                                                                            | Description                            | Default                         |
| --------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------- |
| `formatStateUsing(Closure)`                                                       | Fully override display formatting      | —                               |
| `date()`/`dateTime()`/`time(?string $format)`                                     | Format as a date/datetime/time         | `M j, Y` / `M j, Y H:i` / `H:i` |
| `isoDate()`/`isoDateTime()`/`isoTime()`                                           | Fixed ISO-8601 formats                 | —                               |
| `since()`                                                                         | Relative time ("3 days ago")           | —                               |
| `*Tooltip()` variants of the above                                                | Show the complementary format on hover | —                               |
| `timezone(string)`                                                                | Convert before formatting              | app default                     |
| `numeric(?int $decimalPlaces, $decimalSep, $thousandsSep)`                        | Number formatting                      | 0 decimals, `.`/`,`             |
| `money(?string $currency, ?int $decimalPlaces)`                                   | Currency formatting                    | `USD`, 2 decimals               |
| `markdown()` / `html()`                                                           | Sanitized HTML rendering               | plain text                      |
| `bulleted()` / `listWithLineBreaks()`                                             | List layout                            | inline, comma-separated         |
| `separator(string)`                                                               | Inline list join string                | `, `                            |
| `limitList(int)` / `expandableLimitedList()`                                      | Cap + optionally expand a long list    | —                               |
| `avg()`/`min()`/`max()`/`sum(string $relationship, string $column)`               | Relationship aggregation               | —                               |
| `color(string\|Closure)`                                                          | Text/badge color                       | —                               |
| `icon(string\|Closure\|null)` / `iconPosition('before'\|'after')` / `iconColor()` | Icon beside the value                  | position: `before`              |
| `badge(bool $condition = true)`                                                   | Render as a badge chip                 | `false`                         |
| `enum(class-string)`                                                              | Bind a BackedEnum — implies `badge()`  | —                               |
| `size()` / `weight()` / `fontFamily()`                                            | Typography                             | —                               |
| `limit(int)` / `words(int)` / `lineClamp(int)` / `wrap()`                         | Truncation/wrapping                    | —                               |
| `copyable()` / `copyMessage(string)` / `copyMessageDuration(int)`                 | Click-to-copy                          | "Copied to clipboard"           |
| `prefix()` / `suffix(string\|Closure)`                                            | Static or record-derived affix text    | —                               |
| `prefixAction()` / `suffixAction(EntryAction)`                                    | Clickable affix icon                   | —                               |

Plus every method on the [base Entry API](overview.md#options-base-entry).

## How it's serialized

`TextEntry::toArray()` resolves everything — aggregation, `formatStateUsing`,
date/number formatting, markdown conversion, HTML sanitization — server-side
and assembles the final safe payload through a readonly
`Larafusion\Infolists\Support\TextEntryConfig` DTO (composed from smaller
`TypographyConfig`/`ListConfig`/`TextFormattingConfig`/`AggregationConfig`
DTOs), mirroring the tables package's `IconColumnConfig` pattern. `state`
always arrives as the final display string (or array of strings) — no
closures, models, or query builders are ever serialized, and no formatting
decision is re-made on the frontend.
