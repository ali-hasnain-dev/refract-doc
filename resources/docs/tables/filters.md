# Table Filters

Filters are standalone `Filter` objects passed to `Table::filters([...])` — they are not declared on columns. Each renders one control in the filter panel and applies its own query logic server-side.

### Standalone Filters

Filters are defined in the table's filters array using the Filter classes — they are not declared on columns. The panel position is controlled by the `layout` argument of `->filters()` (or `->filtersLayout()`) — see [Filter Layout](#filter-layout) for all options.

```php
use Larafusion\Tables\Filters\Filter;
use Larafusion\Tables\Filters\SelectFilter;
use Larafusion\Tables\Filters\DateRangeFilter;
use Larafusion\Tables\Filters\TernaryFilter;
use Larafusion\Tables\Filters\TrashedFilter;

->filters([
    // Boolean toggle — fires a custom query closure when active
    Filter::make('active')
        ->label('Active only')
        ->query(fn ($query) => $query->where('is_active', true)),

    // Dropdown — values map directly to a DB column
    SelectFilter::make('role')
        ->label('Role')
        ->options(['admin' => 'Administrator', 'editor' => 'Editor', 'viewer' => 'Viewer'])
        ->searchable()     // add a search box inside the dropdown
        ->multiple(),      // allow selecting multiple values

    // 3-state filter (All / Yes / No)
    TernaryFilter::make('is_verified')
        ->label('Verified')
        ->trueLabel('Verified')
        ->falseLabel('Unverified')
        ->placeholder('All'),

    // Date range
    DateRangeFilter::make('created_at')->label('Joined between'),

    // Soft-delete — shows Active / All / Trashed tabs
    TrashedFilter::make(),
])
```

---

#### Filter (boolean toggle)

Renders as a checkbox / toggle in the filter drawer. When active, fires the `query()` closure.

```php
Filter::make('featured')
    ->label('Featured only')
    ->attribute('is_featured')          // DB column (defaults to filter name)
    ->default('true')                   // pre-activated on page load
    ->indicator('Featured')             // label shown in the active-filter bar
    ->query(fn ($query) => $query->where('is_featured', true))
```

| Method                       | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `->label('...')`             | Display label                                   |
| `->attribute('column')`      | DB column to filter (defaults to filter name)   |
| `->query(fn($query) => ...)` | Custom Eloquent query applied when active       |
| `->default($value)`          | Default value on load                           |
| `->indicator('...')`         | Label shown in the active-filters indicator row |

---

#### SelectFilter

Renders as a list of checkboxes for option-based filtering.

```php
SelectFilter::make('status')
    ->label('Status')
    ->options([
        'draft'     => 'Draft',
        'published' => 'Published',
        'archived'  => 'Archived',
    ])
    ->searchable()           // adds a search box inside the list
    ->multiple()             // allow selecting several values
    ->attribute('status')    // DB column (defaults to filter name)
    ->default('published')   // pre-selected option
    ->query(fn ($q, $value) => $q->whereIn('status', (array) $value))  // optional custom query
```

| Method                          | Description                                                               |
| ------------------------------- | ------------------------------------------------------------------------- |
| `->options([...])`              | `'value' => 'Label'` map of selectable options                            |
| `->options(MyEnum::class)`      | Auto-populate from a BackedEnum's cases                                   |
| `->relationship('rel', 'name')` | Populate options from a related model and filter through the relationship |
| `->multiple()`                  | Allow selecting multiple values at once                                   |
| `->searchable()`                | Show a search box inside the option list                                  |
| `->attribute('column')`         | DB column override                                                        |
| `->default($value)`             | Pre-selected value or array                                               |
| `->query(fn($q, $v) => ...)`    | Custom query; receives the selected value(s)                              |

##### Relationship options

Populate the option list from an Eloquent relationship on the resource model.
Options become `relatedKey => titleAttribute`, and filtering runs through the
relationship (`whereHas`), so it works for `belongsTo`, `hasMany`, and
`belongsToMany`:

```php
SelectFilter::make('Category')
    ->relationship('category', 'name')   // relationship method, title column
    ->multiple()                          // selecting several categories
    ->searchable();                       // search box in the option list
```

Scope the option query with an optional third closure argument:

```php
SelectFilter::make('Author')
    ->relationship('author', 'name', fn ($query) => $query->where('is_active', true))
    ->searchable();
```

Options are resolved server-side when the table config is serialized (the
resource model is known there) and sent to the client, so no extra request is
needed. `->preload()` is accepted for Filament compatibility but is a no-op —
options are always preloaded.

##### Enum options (label, color, icon, description)

Pass a `BackedEnum` to `->options()` and the filter automatically picks up each
case's label, color, icon, and description from the `HasLabel` / `HasColor` /
`HasIcon` / `HasDescription` contracts — the same ones `BadgeColumn::enum()`
uses — so options render as coloured, icon-badged rows that match the table:

```php
SelectFilter::make('status')
    ->options(PostStatus::class)   // enum implementing HasLabel/HasColor/HasIcon
    ->multiple()
    ->searchable();
```

You can also set the metadata manually for a plain array of options:

```php
SelectFilter::make('priority')
    ->options(['low' => 'Low', 'high' => 'High'])
    ->colors(['low' => 'gray', 'high' => 'danger'])
    ->icons(['high' => 'flame'])
    ->descriptions(['high' => 'Needs attention now']);
```

Rendering rules on the client:

- **Multiple**, **searchable**, or **any option metadata present** → the rich
  dropdown (chips, search box, coloured/icon option rows, descriptions),
  matching the form `Select` field with `->native(false)`.
- Plain single select with no metadata → a lightweight native `<select>`.

###### Opting out of enum metadata

The enum may define colors/icons/descriptions, but a given filter can suppress
any or all of them — without changing the enum:

```php
SelectFilter::make('status')->options(PostStatus::class)->withoutIcons();
SelectFilter::make('status')->options(PostStatus::class)->withoutColors();
SelectFilter::make('status')->options(PostStatus::class)->withoutDescriptions();

// Labels only — no color, icon, or description:
SelectFilter::make('status')->options(PostStatus::class)->plain();
```

| Method                    | Effect                                        |
| ------------------------- | --------------------------------------------- |
| `->withoutColors()`       | Neutral chips/labels instead of coloured ones |
| `->withoutIcons()`        | Hide the per-option icon                      |
| `->withoutDescriptions()` | Hide the helper description under each option |
| `->plain()`               | All of the above — labels only                |

Each accepts an optional boolean condition (e.g. `->withoutIcons($isCompact)`),
and the toggles are order-independent — they work whether called before or after
`->options()`. With `->plain()` on a non-searchable single select, the control
falls back to the lightweight native `<select>`.

---

#### TernaryFilter _(new)_

Three-state selector: **All** (no filter) · **Yes** · **No**. Ideal for boolean and nullable columns.

```php
// Boolean column
TernaryFilter::make('is_active')
    ->label('Status')
    ->trueLabel('Active')
    ->falseLabel('Inactive')
    ->placeholder('All Users')    // "All" button label (default: 'All')
    ->attribute('is_active')      // DB column override

// Nullable timestamp — "Yes" = not-null, "No" = null
TernaryFilter::make('email_verified_at')
    ->label('Email verified')
    ->trueLabel('Verified')
    ->falseLabel('Unverified')
    ->nullable()                  // true → whereNotNull; false → whereNull

// Fully custom query per state
TernaryFilter::make('plan')
    ->label('Plan')
    ->trueLabel('Premium')
    ->falseLabel('Free')
    ->queries(
        true:  fn ($q) => $q->where('plan', 'premium'),
        false: fn ($q) => $q->where('plan', 'free'),
        blank: fn ($q) => $q,    // optional — do nothing when "All"
    )
```

| Method                                      | Description                                   |
| ------------------------------------------- | --------------------------------------------- |
| `->trueLabel('...')`                        | "Yes" button text (default: `'Yes'`)          |
| `->falseLabel('...')`                       | "No" button text (default: `'No'`)            |
| `->placeholder('...')`                      | "All" button text (default: `'All'`)          |
| `->attribute('column')`                     | DB column override                            |
| `->nullable()`                              | Filter null vs non-null instead of true/false |
| `->queries(true: fn, false: fn, blank: fn)` | One closure per filter state                  |
| `->default('true'\|'false'\|'')`            | Pre-selected state                            |

---

#### DateRangeFilter

Renders a From / To date pair.

```php
DateRangeFilter::make('created_at')
    ->label('Joined between')
    ->attribute('created_at')      // DB column override
    ->query(fn ($q, $v) => $q      // optional custom query
        ->when($v['from'] ?? null, fn($q, $d) => $q->where('created_at', '>=', $d))
        ->when($v['to']   ?? null, fn($q, $d) => $q->where('created_at', '<=', $d)))
```

---

---

### Filter Layout

Control where and how the filter panel appears with the `FiltersLayout` enum. The easiest way is the `layout` argument of `->filters()`:

```php
use Larafusion\Tables\Enums\FiltersLayout;

->filters([
    // ...
], layout: FiltersLayout::Modal)
```

The default is `FiltersLayout::Dropdown` — you don't need to pass anything for the funnel-icon popover. `->filtersLayout()` is also available on the `Table` builder and accepts the same values. The filter trigger button uses the **funnel icon** (matching Filament's `heroicons:funnel` design).

```php
use Larafusion\Tables\Enums\FiltersLayout;
use Larafusion\Tables\Table;

->filtersLayout(FiltersLayout::Dropdown)                  // Filament-style popover below the filter button (default)
->filtersLayout(FiltersLayout::Drawer)                    // slide-in panel from the right
->filtersLayout(FiltersLayout::Modal)                     // centred modal dialog
->filtersLayout(FiltersLayout::Above)                     // inline panel between the toolbar and the table rows
->filtersLayout(FiltersLayout::AboveCollapsible)          // above, with collapse/expand toggle
->filtersLayout(FiltersLayout::AboveContent)              // inline panel ABOVE the toolbar/search bar
->filtersLayout(FiltersLayout::AboveContentCollapsible)   // above content, with collapse/expand toggle
->filtersLayout(FiltersLayout::Below)                     // inline panel below the table rows
->filtersLayout(FiltersLayout::BeforeContent)             // fixed sidebar to the LEFT of the table
->filtersLayout(FiltersLayout::BeforeContentCollapsible)  // left sidebar with collapse toggle
->filtersLayout(FiltersLayout::AfterContent)              // fixed sidebar to the RIGHT of the table
->filtersLayout(FiltersLayout::AfterContentCollapsible)   // right sidebar with collapse toggle
```

The enum's string values (`'drawer'`, `'modal'`, `'before_content'`, …) are still accepted for backwards compatibility.

Additional layout options:

```php
// Number of grid columns in the filter form (useful for above/below layouts).
// Ignored for the side layouts (before_content / after_content and their
// collapsible variants) — sidebars are always single-column.
->filtersFormColumns(2)

// Panel width — dropdown popover width, drawer width, or modal max-width.
// Increase it when the table has many filters.
->filtersFormWidth('28rem')

// Max-height before the filter list scrolls (drawer / modal)
->filtersFormMaxHeight('400px')

// Hide the active-filter indicator chips row above the table
->hiddenFilterIndicators()
```

**Layout behaviour summary:**

| Layout                                    | Where rendered                                 | Trigger                   | Collapsible? |
| ----------------------------------------- | ---------------------------------------------- | ------------------------- | ------------ |
| `FiltersLayout::Dropdown`                 | Popover below the filter icon button (default) | Icon-only button + badge  | —            |
| `FiltersLayout::Drawer`                   | Slide-in panel from right                      | Button with label + badge | —            |
| `FiltersLayout::Modal`                    | Centred dialog                                 | Button with label + badge | —            |
| `FiltersLayout::Above`                    | Inline — between toolbar and table rows        | None                      | No           |
| `FiltersLayout::AboveCollapsible`         | Inline — between toolbar and table rows        | None                      | Yes          |
| `FiltersLayout::AboveContent`             | Inline — above the toolbar/search bar          | None                      | No           |
| `FiltersLayout::AboveContentCollapsible`  | Inline — above the toolbar/search bar          | None                      | Yes          |
| `FiltersLayout::Below`                    | Inline — below table rows                      | None                      | No           |
| `FiltersLayout::BeforeContent`            | Sticky sidebar, left of table                  | None                      | No           |
| `FiltersLayout::BeforeContentCollapsible` | Sticky sidebar, left of table                  | None                      | Yes          |
| `FiltersLayout::AfterContent`             | Sticky sidebar, right of table                 | None                      | No           |
| `FiltersLayout::AfterContentCollapsible`  | Sticky sidebar, right of table                 | None                      | Yes          |

Side-layout sidebars stick to the viewport while the table scrolls, so the Reset / Apply buttons stay visible even on long pages (e.g. 50 rows per page); the filter list scrolls internally when it outgrows the viewport.

**Full example:**

```php
Table::make()
    ->columns([...])
    ->filters([
        SelectFilter::make('role')->options([...]),
        TernaryFilter::make('is_active')->label('Active'),
    ], layout: FiltersLayout::BeforeContent)   // sidebar to the left
    ->filtersFormMaxHeight('600px')
```

> **Active-filter indicators:** Active-filter chips are shown **only** for the trigger-based layouts (`Dropdown` / `Modal` / `Drawer`), rendered in a full-width row directly below the table's column-header row; the trigger button also shows a badge count. Inline (`Above` / `AboveCollapsible` / `AboveContent` / `AboveContentCollapsible` / `Below`) and side layouts show no chips — their filter form is visible on the page, with a funnel-icon header and a count badge instead. Chips and badge counts reflect **applied** filters only — editing the filter form doesn't change them until the user clicks Apply (or Reset). In every layout the **Reset** action is red and only appears while filters are applied; clicking it clears and re-queries immediately. `->hiddenFilterIndicators()` hides the chips row.

#### Persisting filters in the user's session

```php
Table::make()
    ->filters([...])
    ->persistFiltersInSession()
```

With `->persistFiltersInSession()`, the applied filter set is stored in the Laravel session — scoped to the current table (resource) and, since sessions are per user, to the current user. Navigating away and returning to the index page restores the last applied filters automatically (via redirect, so the URL — and therefore chips, badges, export links — always reflects the active filters). Applying a different set overwrites the stored one; pressing **Reset** (or removing the last chip) clears it. Partial reloads (sorting, pagination, polling) never alter the stored set.

---

#### Base Filter Methods (all filter types share these)

| Method                  | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `->label('...')`        | Display label shown in the filter drawer          |
| `->attribute('column')` | DB column to filter (defaults to the filter name) |
| `->query(\Closure $cb)` | Custom Eloquent query closure                     |
| `->default($value)`     | Default value loaded when the page opens          |
| `->indicator('...')`    | Short label for the active-filter indicator       |

---
