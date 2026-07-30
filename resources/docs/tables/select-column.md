# Select Column

`SelectColumn` renders an inline-editable dropdown directly in a table cell. A user
changes a value in place — no navigation to an edit page — and the change is saved
with a `PATCH` request. It is the table-column counterpart to the `Select` form
field and mirrors its API.

```php
use Larafusion\Columns\SelectColumn;
use Larafusion\Tables\Table;

public static function table(Table $table): Table
{
    return $table->columns([
        SelectColumn::make('status')
            ->options([
                'draft'     => 'Draft',
                'reviewing' => 'Reviewing',
                'published' => 'Published',
            ]),
    ]);
}
```

Everything below is enforced on the server. The options you see, the rules that
run, and the identity of the column being edited are all re-derived server-side
from an encrypted token — the browser is never trusted to name a table, a column,
or a valid value.

---

## Options

Provide a value → label map, a grouped map, a `BackedEnum` class, or a closure:

```php
SelectColumn::make('status')->options([
    'draft'     => 'Draft',
    'published' => 'Published',
]);

// Grouped
SelectColumn::make('status')->options([
    'Active'   => ['draft' => 'Draft', 'published' => 'Published'],
    'Inactive' => ['archived' => 'Archived'],
]);

// Enum (labels come from the enum's HasLabel implementation)
SelectColumn::make('status')->options(PostStatus::class);

// Closure
SelectColumn::make('priority')->options(fn () => Priority::map());
```

---

## Native vs. JavaScript select

By default the column renders a native HTML `<select>` — fast, accessible, and
styled by the operating system. Call `native(false)` for the JavaScript dropdown,
which supports richer presentation and searching.

```php
SelectColumn::make('status')->native(false);
```

---

## Searching options

`searchableOptions()` turns the control into a combobox with a search box. For
static options the filtering happens in the browser; for relationship- or
callback-sourced options it queries the server as the user types.

```php
SelectColumn::make('author_id')
    ->searchableOptions()
    ->getOptionsSearchResultsUsing(fn (string $search) => User::query()
        ->where('name', 'like', "%{$search}%")
        ->limit(50)
        ->pluck('name', 'id')
        ->all())
    ->getOptionLabelUsing(fn ($value) => User::find($value)?->name);
```

`getOptionsSearchResultsUsing()` returns the matches for a term.
`getOptionLabelUsing()` resolves the label for the currently-stored value so the
cell shows the right text before the dropdown is ever opened.

Tune the debounce (default `1000`ms) with `optionsSearchDebounce()`:

```php
SelectColumn::make('author_id')->searchableOptions()->optionsSearchDebounce(500);
```

---

## Relationship options

Populate a column from an Eloquent relationship on the resource model. Options
become `[relatedKey => titleAttribute]`, and searching runs against the related
table.

```php
SelectColumn::make('author_id')
    ->optionsRelationship('author', 'name')
    ->searchableOptions()
    ->preloadOptions();
```

Scope the options query with `modifyQueryUsing()`, and derive a custom label from
each related record with `getOptionLabelFromRecordUsing()`:

```php
SelectColumn::make('author_id')
    ->optionsRelationship('author', 'name')
    ->modifyQueryUsing(fn ($query, ?string $search) => $query
        ->where('active', true)
        ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")))
    ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->name} ({$record->email})");
```

`preloadOptions()` sends the first page of options with the table so the dropdown
opens instantly; without it, options load when the dropdown is first opened.

Resolved labels are cached for the request by default. Disable with
`rememberOptions(false)`.

---

## Disabling the placeholder

By default the null / placeholder entry is selectable (clearing the value).
Prevent that with `selectablePlaceholder(false)`.

```php
SelectColumn::make('status')->selectablePlaceholder(false);
```

---

## Disabling specific options

Disable options statically or with a predicate. Disabled options can never be
saved — the server rejects them even if a request is crafted by hand.

```php
SelectColumn::make('status')->disabledOptions(['archived']);

SelectColumn::make('status')
    ->disableOptionWhen(fn ($value, $record) => $value === 'published' && ! $record->is_ready);
```

---

## Limiting and wrapping

```php
SelectColumn::make('author_id')->optionsRelationship('author', 'name')->optionsLimit(20);

SelectColumn::make('status')->wrapOptionLabels(false); // truncate long labels
```

---

## HTML in labels

Labels are plain text by default. Opt in to HTML with `allowOptionsHtml()`; the
markup is sanitized before rendering (scripts, attributes, and unknown tags are
stripped), so it is safe against injection.

```php
SelectColumn::make('status')
    ->allowOptionsHtml()
    ->options([
        'draft'     => '<i>Draft</i>',
        'published' => '<strong>Published</strong>',
    ]);
```

---

## Messages

Customize the four dropdown states:

```php
SelectColumn::make('author_id')
    ->searchableOptions()
    ->loadingMessage('Loading authors…')
    ->searchingMessage('Searching…')
    ->noSearchResultsMessage('No authors match your search.')
    ->searchPrompt('Start typing to search authors.');
```

---

## Lifecycle hooks

Run logic before and after the state is written. `beforeStateUpdated` may return a
value to override what is saved, or use the injected `$set` / `$get` utilities to
mutate sibling attributes. Utilities are injected by parameter name or type, so
declare only what you need.

```php
SelectColumn::make('status')
    ->beforeStateUpdated(function ($record, $state, $old, $set) {
        if ($state === 'published') {
            $set('published_at', now());
        }
    })
    ->afterStateUpdated(function ($record, $state, $old) {
        activity()->performedOn($record)->log("Status changed from {$old} to {$state}");
    });
```

---

## Validation

Attach rules exactly as you would on a form field. A membership rule is added
automatically: `in:` over the static option values, or `exists:` on the related
table for relationship options. The client receives a display-safe subset; the
server always re-validates with the full set.

```php
SelectColumn::make('status')
    ->rules(['required'])
    ->validationMessages(['in' => 'Choose a valid status.'])
    ->validationAttribute('post status');
```

---

## Disabling editing

```php
SelectColumn::make('status')->disabled();

SelectColumn::make('status')->disabled(fn ($record) => $record->is_locked);
```

A disabled column renders as a read-only label.

---

## Security model

- Every cell carries an **encrypted identity token** (`{resource, column}`), bound
  to your `APP_KEY`. The client cannot name a different table or column.
- Each endpoint re-runs `canEdit()` authorization, so a request can never escalate
  beyond the resource's own permission gate.
- The `PATCH` handler re-validates the value (rules + `in`/`exists`), rejects
  disabled options, and runs the lifecycle hooks — independently of anything the
  browser did.

### Endpoints

| Method | Path                                | Purpose                      |
| ------ | ----------------------------------- | ---------------------------- |
| GET    | `/admin/select-column/search`       | Type-ahead search results    |
| GET    | `/admin/select-column/option-label` | Label for the stored value   |
| GET    | `/admin/select-column/options`      | Full / preloaded option list |
| PATCH  | `/admin/select-column`              | Persist a new value          |

---

## Related

- [Table Columns](../../features/table-columns.md)
- [Inline Editing](../../features/inline-editing.md)
- Form field equivalent: `Larafusion\Fields\Select`
