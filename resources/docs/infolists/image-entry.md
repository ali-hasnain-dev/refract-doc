# ImageEntry

`Larafusion\Infolists\Entries\ImageEntry` — displays an image (or a small
gallery / avatar-style stack, for array state) resolved from a disk, a
signed private-disk URL, or an already-absolute remote URL. Every URL is
resolved **entirely server-side** before it reaches the frontend — `state`
always arrives as the final, ready-to-use `<img src>` value(s).

```php
use Larafusion\Infolists\Entries\ImageEntry;

ImageEntry::make('avatar')->circular()->size('4rem');

ImageEntry::make('gallery')->stacked()->ring('2px')->overlap(10);

ImageEntry::make('logo_url'); // already-absolute URLs pass straight through
```

## Local and remote images

The underlying attribute can be:

- **A disk-relative path** (`"avatars/1.png"`) — resolved to a full URL via
  `disk()`/`visibility()` below.
- **An already-absolute URL** (`https://…` or a protocol-relative `//…`) —
  passed through completely unchanged, no disk resolution attempted. This is
  how a `logo_url` column pointing at a remote CDN image works with zero
  extra configuration.

## Storage disks and visibility

```php
ImageEntry::make('avatar')->disk('s3');

// Generate a short-lived signed URL instead of a plain public one —
// necessary for private disks (S3 buckets without public ACLs, etc.):
ImageEntry::make('document_preview')->disk('s3')->visibility('private');
```

`visibility('private')` calls the disk's `temporaryUrl()` (a 5-minute signed
URL). If the underlying driver doesn't support `temporaryUrl()` (the `local`
driver doesn't, out of the box — only cloud-style adapters like S3, or a
disk with a custom `buildTemporaryUrlsUsing()` callback, do), resolution
degrades gracefully to `null` — the entry's `placeholder()`/`defaultImageUrl()`
takes over instead of a hard 500 error. `disk()`/`visibility()` both accept
a closure resolved against the record.

## Default images

`defaultImageUrl()` is a ready-to-use URL fallback shown when the resolved
state is empty — distinct from `default()` (shared with every entry), which
supplies a raw _path_ still resolved through the disk:

```php
ImageEntry::make('avatar')->defaultImageUrl('/images/default-avatar.png');

// Record-aware, like every other closure-accepting setter here:
ImageEntry::make('avatar')->defaultImageUrl(fn ($record) => "/images/avatars/{$record->initials}.png");
```

## Sizing

```php
ImageEntry::make('avatar')->height('4rem')->width('8rem'); // independent dimensions
ImageEntry::make('avatar')->size('3rem');                  // shorthand for height($x)->width($x)
```

Both accept a closure resolved against the record.

## Shape

```php
ImageEntry::make('avatar')->circular(); // fully rounded, avatar-style
ImageEntry::make('logo')->square();     // sharp corners
// Neither called → default rounded corners (rounded-lg)
```

## Stacking (avatar groups)

When the resolved state is an array of images (a JSON column, a plucked
relation, a gallery field), `stacked()` renders them as an overlapping
avatar-style group instead of a plain row:

```php
ImageEntry::make('team_avatars')
    ->stacked()
    ->ring('2px')     // border/ring width separating each overlapping image
    ->overlap(10);    // how many pixels each image overlaps the previous one
```

Without `stacked()`, an array state renders as a simple wrapping gallery row
instead.

## Custom `<img>` attributes

```php
ImageEntry::make('avatar')->extraImgAttributes([
    'loading' => 'eager',   // override the lazy-loading default
    'data-testid' => 'avatar-image',
]);
```

Accepts a closure resolved against the record, and `merge: true` to combine
with a previous call instead of replacing it.

## Clickable images

Images support the same `url()`/`openUrlInNewTab()` every entry does — the
whole rendered image (or gallery/stack) becomes a link:

```php
ImageEntry::make('avatar')->url(fn ($record) => route('users.show', $record));
```

## Tooltips, labels, and placeholders

Every shared [base Entry](overview.md#options-base-entry) feature works —
`label()`, `placeholder()`, `tooltip()`, `hidden()`/`visible()`,
`inlineLabel()`, `alignment()`, and the slots.

## Accessibility and broken images

Every image gets an `alt` attribute from the entry's label (indexed per item
in a gallery/stack — `"Team Photo 1"`, `"Team Photo 2"`, …). If an image
fails to load, it's replaced in place with an accessible placeholder
(`role="img"`, matching `aria-label`, an icon glyph) at the same configured
dimensions — never a visibly broken `<img>`. Images lazy-load
(`loading="lazy"`, `decoding="async"`) by default; override via
`extraImgAttributes(['loading' => 'eager'])` for above-the-fold images.

## Options

| Method                                                    | Description                                                          | Default         |
| --------------------------------------------------------- | -------------------------------------------------------------------- | --------------- |
| `disk(string\|Closure)`                                   | Filesystem disk the state's relative path resolves against           | `public`        |
| `visibility(string\|Closure)`                             | `'public'` (plain disk URL) or `'private'` (signed `temporaryUrl()`) | disk default    |
| `height(string\|Closure)` / `width(string\|Closure)`      | Independent CSS dimensions                                           | `6rem` / `6rem` |
| `size(string\|Closure)`                                   | Shorthand for `height($x)->width($x)`                                | —               |
| `circular(bool $condition = true)`                        | Fully rounded corners                                                | `false`         |
| `square(bool $condition = true)`                          | Sharp corners                                                        | `false`         |
| `stacked(bool $condition = true)`                         | Render an array state as an overlapping avatar stack                 | `false`         |
| `ring(string\|int\|Closure $width = 3)`                   | Ring/border width around each stacked image                          | `3` (px)        |
| `overlap(int\|Closure $overlap = 4)`                      | Pixels each stacked image overlaps the previous one                  | `4`             |
| `defaultImageUrl(string\|Closure)`                        | Ready-to-use fallback URL shown when state is empty                  | —               |
| `extraImgAttributes(array\|Closure, bool $merge = false)` | Raw attributes merged onto the `<img>` tag                           | `[]`            |

Plus every method on the [base Entry API](overview.md#options-base-entry) —
`url()`/`openUrlInNewTab()` make the image clickable, `tooltip()` shows on
hover near the label.

## How it's serialized

`ImageEntry::toArray()` never sends a closure, model, or query object to the
client. Every closure passed to `disk()`/`visibility()`/`height()`/`width()`/
`size()`/`ring()`/`overlap()`/`defaultImageUrl()`/`extraImgAttributes()` is
evaluated **against the actual record**, server-side, with utility injection
by parameter name/type (`record`, `entry`, `name`). URL resolution — disk
path → full URL, private-disk signing, remote-URL passthrough, and the
`defaultImageUrl()` fallback — all happen in `resolveState()` before
serialization, so `state` is always the final display value(s), never a raw
path the frontend has to guess a `/storage/` prefix for. The final payload is
assembled through two focused readonly DTOs —
`Larafusion\Infolists\Support\ImageStyleConfig` (`height`/`width`/`shape`)
and `ImageStackConfig` (`stacked`/`ring`/`overlap`) — composed by
`ImageEntryConfig`, mirroring `TextEntryConfig`'s/`IconEntryConfig`'s
composition pattern. The React `ImageEntryView` component is purely
presentational: it lays already-resolved URLs out (single image, gallery, or
stack) and handles broken images gracefully, with no server round trip and
no re-resolution of any business logic.
