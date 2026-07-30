# CodeEntry

`Larafusion\Infolists\Entries\CodeEntry` — displays a value as a
syntax-highlighted, monospaced code block, with optional line numbers,
click-to-copy, and either horizontal scrolling or wrapping for long lines.

```php
use Larafusion\Infolists\Entries\CodeEntry;

CodeEntry::make('payload')
    ->language('json');

CodeEntry::make('handler_source')
    ->language('php')
    ->copyable()
    ->copyMessage('Snippet copied!')
    ->copyMessageDuration(2500)
    ->wrap();
```

## Language

```php
CodeEntry::make('payload')->language('json');
CodeEntry::make('script')->language('js');   // aliases are normalized — see below
CodeEntry::make('script')->language(fn ($record) => $record->content_type);
```

`language()` is resolved and normalized **server-side**. A supported common
alias (`js` → `javascript`, `ts` → `typescript`, `sh`/`shell` → `bash`,
`yml` → `yaml`, `md` → `markdown`, `html`/`htm`/`xml` → `markup`, `py` →
`python`, `rb` → `ruby`, `rs` → `rust`, `golang` → `go`) is mapped to its
canonical key before it ever reaches the frontend. Currently-supported
languages: `php`, `javascript`, `typescript`, `jsx`, `tsx`, `json`, `css`,
`scss`, `bash`, `sql`, `python`, `yaml`, `markdown`, `markup` (HTML/XML),
`java`, `go`, `ruby`, `rust`, and `clike`.

If no language is set, or the given value isn't recognized (a typo, or a
language Larafusion doesn't ship a grammar for), the code still displays in
full — as plain, safely-escaped text, without syntax highlighting. Nothing is
ever hidden just because the language couldn't be resolved.

## Line numbers

A line-number gutter appears automatically whenever the code spans more than
one line; single-line snippets render without one. There's no separate
toggle for this — it's driven entirely by the content.

## Wrapping vs. scrolling

```php
CodeEntry::make('payload')->wrap();
```

By default (`wrap(false)`), long lines scroll horizontally within the code
block instead of stretching the layout. `wrap(true)` allows long lines to
wrap onto multiple visual rows instead — note that in this mode, the line
number gutter still reflects logical lines (matching the source), not
visually-wrapped rows, which is standard behavior for most code viewers
(GitHub included).

## Copy to clipboard

```php
CodeEntry::make('payload')
    ->copyable()
    ->copyMessage('Copied!')     // default: "Copied to clipboard"
    ->copyMessageDuration(3000); // ms
```

Clicking the copy button (shown in the block's top-right corner on hover/
focus) copies the raw, unhighlighted code exactly as stored — never the
highlighted markup. The frontend uses the modern async Clipboard API
(`navigator.clipboard.writeText()`), automatically falling back to the
legacy `document.execCommand('copy')` technique when `navigator.clipboard`
isn't available. If both methods fail, the copy is silently skipped rather
than showing a false "copied" toast.

`copyMessage()`/`copyMessageDuration()` only take effect when `copyable()`
is also enabled.

## Rendering and security

Syntax highlighting happens entirely **client-side**, via Prism. Prism
always HTML-escapes the source text before tokenizing it — it never treats
the code value as pre-existing HTML, even when the selected language is
`markup` (HTML/XML). A `<script>` tag typed into a code snippet is displayed
as visible text, never executed, whether or not a language is set. When no
language is set (or it's unrecognized), the code renders as a plain React
text node, which React itself escapes — there's no highlighting path to
reason about at all in that case.

## Tooltips, labels, and placeholders

Every shared [base Entry](overview.md#options-base-entry) feature works —
`label()`, `placeholder()`, `tooltip()`, `default()`, `hidden()`/`visible()`,
`inlineLabel()`, `alignment()`, and the slots:

```php
CodeEntry::make('payload')
    ->label('Request Payload')
    ->placeholder('No payload recorded')
    ->default('{}')
    ->tooltip('Raw JSON body received from the webhook');
```

## Accessibility

The line-number gutter is `aria-hidden` (purely decorative — the code text
itself already conveys the content). The copy control has
`role="button"`, `tabIndex={0}`, and a descriptive `aria-label`
("Copy code to clipboard"), and is activatable via both <kbd>Enter</kbd> and
<kbd>Space</kbd>.

## Options

| Method                                   | Description                                       | Default               |
| ---------------------------------------- | ------------------------------------------------- | --------------------- |
| `language(string\|Closure\|null)`        | The language to highlight against                 | none (plain text)     |
| `wrap(bool $condition = true)`           | Wrap long lines instead of scrolling horizontally | `false`               |
| `copyable(bool $condition = true)`       | Enable click-to-copy                              | `false`               |
| `copyMessage(string)`                    | Toast message shown after a successful copy       | "Copied to clipboard" |
| `copyMessageDuration(int $milliseconds)` | How long the copy toast stays visible             | app default           |

Plus every method on the [base Entry API](overview.md#options-base-entry).

## How it's serialized

`CodeEntry::toArray()` never sends a closure, model, or query object to the
client — `language()`'s closure form is evaluated and normalized entirely
server-side via `Larafusion\Infolists\Support\CodeLanguageResolver`. The
payload is assembled through three focused readonly DTOs —
`Larafusion\Infolists\Support\CodeLanguageConfig` (the normalized
`language`, omitted entirely when unset/unsupported),
`Larafusion\Infolists\Support\CodeRenderConfig` (`wrap`), and
`Larafusion\Infolists\Support\CopyConfig` (`copyable`/`copyMessage`/
`copyMessageDuration`, shared with `TextEntry`/`ColorEntry`) — composed by
`CodeEntryConfig`, mirroring the composition pattern used by every other
entry's config DTO. `state` holds the raw, un-highlighted code string; the
React `CodeEntryView` component tokenizes it via Prism (see
`resources/js/lib/prismLanguages.ts` in `@larafusion/infolists`) purely for
display, and performs the clipboard write client-side — no server round
trip, no re-resolution of any business logic.

### Why Prism, not Shiki

Shiki produces higher-fidelity, VS Code-quality highlighting, but its API is
asynchronous (grammar/theme loading happens via `await`) and its full
grammar bundles are considerably heavier — a poor fit for a purely
declarative, synchronously-rendered entry type in a dependency-light admin
package. Prism's `Prism.highlight()` is synchronous, its per-language
grammars are small, and it HTML-escapes its input by construction, which
keeps `CodeEntryView` as simple and safe as every other entry view in this
package. `prismjs` was added as a direct dependency of `@larafusion/infolists`
(not `@larafusion/support`) since it's the only package that needs it.
