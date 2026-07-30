# Tables

## Tables

### Table Builder (Filament-style)

Override `table()` on your resource (instead of `columns()`) for the full-featured Filament-style API:

```php
// app/Larafusion/Resources/Users/Tables/UsersTable.php
namespace App\Larafusion\Resources\Users\Tables;

use Larafusion\Tables\Table;
use Larafusion\Columns\TextColumn;
use Larafusion\Columns\BadgeColumn;
use Larafusion\Columns\BooleanColumn;
use Larafusion\Columns\DateColumn;
use Larafusion\Columns\ImageColumn;
use Larafusion\Tables\Filters\SelectFilter;
use Larafusion\Tables\Filters\Filter;
use Larafusion\Tables\Actions\Action;
use Larafusion\Tables\Actions\EditAction;
use Larafusion\Tables\Actions\DeleteAction;
use Larafusion\Tables\Actions\BulkActionGroup;
use Larafusion\Tables\Actions\DeleteBulkAction;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar')->circular()->size('2.5rem'),

                TextColumn::make('name')
                    ->sortable()
                    ->searchable()
                    ->copyable(),

                TextColumn::make('email')
                    ->sortable()
                    ->searchable(),

                BadgeColumn::make('role')
                    ->colors([
                        'primary' => 'admin',
                        'success' => 'editor',
                        'info'    => 'viewer',
                    ]),

                BooleanColumn::make('is_active')
                    ->label('Active'),

                DateColumn::make('created_at')
                    ->label('Joined')
                    ->sortable()
                    ->since(),   // "3 days ago"
            ])
            ->filters([
                SelectFilter::make('role')
                    ->options([
                        'admin'  => 'Administrator',
                        'editor' => 'Editor',
                        'viewer' => 'Viewer',
                    ]),
                Filter::make('active')
                    ->label('Active only')
                    ->query(fn ($q) => $q->where('is_active', true)),
            ])
            ->recordActions([
                EditAction::make(),

                // Filament-style inline custom action
                Action::make('approve')
                    ->label('Approve')
                    ->icon('check')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn ($r) => $r->status === 'pending')
                    ->action(fn ($r) => $r->update(['status' => 'approved']))
                    ->successNotificationTitle('Approved!'),

                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->heading('Users')
            ->description('Manage your system users.')
            ->emptyState('No users found', 'Try adjusting your search or filters.');
    }
}
```

Wire it in the resource:

```php
public static function table(Table $table): Table
{
    return UsersTable::configure($table);
}
```

**Auto-merge of sortable:** columns declared with `->sortable()` are automatically merged into the server-side sort allowlist — you no longer need a separate `$sortable` array when using the table builder.

#### Table Builder Methods

| Method                                   | Description                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `->columns([...])`                       | Column definitions                                                                                                                                                                                                                                                                                                 |
| `->pushColumns([...])`                   | Append columns to existing list                                                                                                                                                                                                                                                                                    |
| `->filters([...])`                       | Standalone filter definitions                                                                                                                                                                                                                                                                                      |
| `->recordActions([...])`                 | Per-row actions: built-in (EditAction, DeleteAction, ViewAction) or custom `Action::make()`                                                                                                                                                                                                                        |
| `->toolbarActions([...])`                | Toolbar / bulk actions (must wrap with BulkActionGroup)                                                                                                                                                                                                                                                            |
| `->defaultSort('field', 'asc')`          | Default sort column and direction (`'asc'` or `'desc'`)                                                                                                                                                                                                                                                            |
| `->striped()`                            | Alternating row shading                                                                                                                                                                                                                                                                                            |
| `->heading('...')`                       | Title displayed above the table card                                                                                                                                                                                                                                                                               |
| `->description('...')`                   | Subtitle below the heading                                                                                                                                                                                                                                                                                         |
| `->emptyState('heading', 'description')` | Custom empty state message                                                                                                                                                                                                                                                                                         |
| `->polling('30s')`                       | Auto-refresh interval — reloads just the records prop                                                                                                                                                                                                                                                              |
| `->deferLoading()`                       | Load records asynchronously on first visit                                                                                                                                                                                                                                                                         |
| `->reorderable('sort')`                  | Enable drag-to-reorder using the named column                                                                                                                                                                                                                                                                      |
| `->pagination()`                         | Full numbered pagination (default)                                                                                                                                                                                                                                                                                 |
| `->pagination('simple')`                 | Show only Prev/Next buttons instead of numbered page links; overrides the panel-level default                                                                                                                                                                                                                      |
| `->pagination(false)`                    | Disable pagination — all records returned on one page                                                                                                                                                                                                                                                              |
| `->filtersLayout(FiltersLayout::Modal)`  | Where/how the filter panel appears — `FiltersLayout` enum case or string value (`Dropdown` (default) · `Drawer` · `Modal` · `Above` · `AboveCollapsible` · `Below` · `BeforeContent` · `BeforeContentCollapsible` · `AfterContent` · `AfterContentCollapsible`); also settable via `->filters([...], layout: ...)` |
| `->filtersFormColumns(2)`                | Grid columns inside the filter form (default: 1; side layouts are always 1)                                                                                                                                                                                                                                        |
| `->filtersFormWidth('28rem')`            | Width of the filter panel — dropdown popover width, drawer width, or modal max-width                                                                                                                                                                                                                               |
| `->filtersFormMaxHeight('400px')`        | Max-height before filter panel scrolls                                                                                                                                                                                                                                                                             |
| `->hiddenFilterIndicators()`             | Hide the active-filter indicator chips row                                                                                                                                                                                                                                                                         |
| `->persistFiltersInSession()`            | Persist applied filters in the user's session (per table, per user) and restore them on the next visit                                                                                                                                                                                                             |

---

### Built-in Record Actions

Control which action buttons appear on each table row. When `recordActions()` is defined, **only** those actions are shown. Omitting `recordActions()` falls back to showing all three built-in actions (View, Edit, Delete) based on the resource's `can.*` permissions.

```php
use Larafusion\Tables\Actions\EditAction;
use Larafusion\Tables\Actions\DeleteAction;
use Larafusion\Tables\Actions\ViewAction;

->recordActions([
    ViewAction::make(),      // "View" link → /admin/{resource}/{id}
    EditAction::make(),      // "Edit" link → /admin/{resource}/{id}/edit
    DeleteAction::make(),    // "Delete" button with confirmation dialog
])
```

Customise labels and appearance:

```php
->recordActions([
    EditAction::make()->label('Modify'),
    DeleteAction::make()
        ->label('Remove')
        ->confirm('Permanently remove this record?'),

    DeleteAction::make()->withoutConfirmation(),  // skip confirm dialog
])
```

The checkbox column and bulk actions toolbar are **hidden automatically** when `toolbarActions([])` is explicitly set to an empty array. Omitting `toolbarActions()` entirely keeps the legacy bulk-delete behavior.

| Class          | Default label | Default color | Notes                                                         |
| -------------- | ------------- | ------------- | ------------------------------------------------------------- |
| `EditAction`   | Edit          | primary       | Navigates to the edit page (or opens modal)                   |
| `DeleteAction` | Delete        | danger        | Shows the shared animated confirmation dialog before deleting |
| `ViewAction`   | View          | default       | Navigates to the show/detail page                             |

> **Consistent confirmation UI** — all delete paths (single row, bulk, force delete, and the Delete header action on Show/Edit pages) use the same animated modal dialog: an `AlertTriangle` icon in a red circle, a title, a message, and full-width Cancel / Delete buttons. There is no native `window.confirm()` anywhere in the panel UI.

---

### Custom Action (Filament-style)

`Action::make()` is the recommended way to add any server-side or URL-based custom action directly inside `->recordActions()`. It supports the full Filament action API — confirmation dialogs, display modes, visibility conditions, notifications, tooltips, and badges.

```php
use Larafusion\Tables\Actions\Action;

->recordActions([
    EditAction::make(),

    Action::make('reset_password')
        ->label('Reset Password')
        ->icon('refresh')
        ->color('warning')
        ->iconOnly()                          // or ->textOnly() / ->button()
        ->requiresConfirmation()              // generic "Are you sure?" dialog
        ->modalHeading('Reset Password')      // custom dialog heading
        ->modalDescription('This will send a password reset email to the user.')
        ->modalSubmitActionLabel('Send Link') // confirm button text
        ->action(function ($record) {
            \Illuminate\Support\Facades\Password::sendResetLink(['email' => $record->email]);
        })
        ->successNotificationTitle('Password reset link sent.')
        ->tooltip('Send password reset email')
        ->visible(fn ($record) => $record->email !== null),

    // URL-based action (no server round-trip)
    Action::make('preview')
        ->label('Preview')
        ->icon('eye')
        ->url(fn ($record) => "/blog/{$record->slug}")
        ->openUrlInNewTab(),

    DeleteAction::make(),
])
```

#### Action Method Reference

| Method                                                       | Description                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `->label('...')`                                             | Button text                                                          |
| `->icon('...')`                                              | Lucide icon name (see [Available Icons](#available-icons))           |
| `->color('...')`                                             | `default` · `primary` · `success` · `warning` · `danger`             |
| `->iconOnly()`                                               | Show icon only (default)                                             |
| `->textOnly()`                                               | Show label only                                                      |
| `->button()`                                                 | Pill button with icon + label                                        |
| `->primary()` / `->success()` / `->warning()` / `->danger()` | Color shorthands                                                     |
| `->requiresConfirmation()`                                   | Show "Are you sure?" dialog before executing                         |
| `->confirm('message')`                                       | Dialog with custom message                                           |
| `->modalHeading('...')`                                      | Custom dialog heading                                                |
| `->modalDescription('...')`                                  | Custom dialog body text                                              |
| `->modalSubmitActionLabel('...')`                            | Custom confirm button label                                          |
| `->action(fn($record) => ...)`                               | Server-side callback; fired via `POST /{resource}/{id}/action/{key}` |
| `->url('/path')` or `->url(fn($r) => ...)`                   | Navigate to URL instead of calling server                            |
| `->openUrlInNewTab()`                                        | Open URL in a new tab                                                |
| `->successNotificationTitle('...')`                          | Flash message shown after success                                    |
| `->failureNotificationTitle('...')`                          | Flash message shown on failure                                       |
| `->tooltip('...')`                                           | Tooltip on hover (especially useful in icon-only mode)               |
| `->badge('3', 'danger')`                                     | Small badge overlaid on the button                                   |
| `->visible(fn($record) => ...)`                              | Conditionally show per record                                        |
| `->hidden()`                                                 | Always hide                                                          |

> **How execution works:** When the user clicks the action, the frontend POSTs to `POST /admin/{resource}/{id}/action/{key}`. The `ActionController` resolves the action from either `actions()` (legacy) or `recordActions()` (new), calls `->action()`, and returns the success notification. No extra route or controller code is needed.

---

### Toolbar & Bulk Actions

Bulk actions appear in a dropdown when the user selects one or more rows. All bulk action types **must** be nested inside `BulkActionGroup::make([...])`:

```php
use Larafusion\Tables\Actions\BulkActionGroup;
use Larafusion\Tables\Actions\DeleteBulkAction;
use Larafusion\Tables\Actions\ForceDeleteBulkAction;
use Larafusion\Tables\Actions\RestoreBulkAction;

->toolbarActions([
    BulkActionGroup::make([
        DeleteBulkAction::make(),            // soft-delete selected rows
        ForceDeleteBulkAction::make(),       // permanently delete (soft-delete resources)
        RestoreBulkAction::make(),           // restore trashed rows
    ]),
])
```

> **Important:** `DeleteBulkAction::make()` passed _directly_ to `toolbarActions([])` without a `BulkActionGroup` wrapper will be silently ignored — the frontend only renders items inside groups.

Each bulk action class accepts a custom label:

```php
DeleteBulkAction::make()->label('Archive selected')
ForceDeleteBulkAction::make()->label('Wipe selected')
RestoreBulkAction::make()->label('Recover selected')
```

| Class                   | Default label         | Route called                           | Confirmation           |
| ----------------------- | --------------------- | -------------------------------------- | ---------------------- |
| `DeleteBulkAction`      | Delete selected       | `DELETE /{resource}/bulk`              | Animated modal dialog  |
| `ForceDeleteBulkAction` | Force delete selected | `DELETE /{resource}/bulk-force-delete` | Animated modal dialog  |
| `RestoreBulkAction`     | Restore selected      | `POST /{resource}/bulk-restore`        | None (non-destructive) |

---

### Column Classes

All column classes live under `Larafusion\Columns\*`.

Each column type has its own reference page with all its options:

- [TextColumn](text-column.md) — text with truncation, badges, copy, money, prefixes/suffixes
- [BadgeColumn](badge-column.md) — coloured pill badges mapped from values or enums
- [BooleanColumn](boolean-column.md) — true/false icon in a semantic color
- [DateColumn](date-column.md) — formatted or relative dates
- [ImageColumn](image-column.md) — avatars/thumbnails, circular or stacked
- [IconColumn](icon-column.md) — value→icon mapping, boolean check/x, dynamic colors/sizes, multiple icons, tooltips
- [SelectColumn](select-column.md) — inline-editable select cell
- [ToggleColumn](toggle-column.md) — inline-editable boolean switch

#### Common Column Methods

All column classes extend the base `Column` and share these methods:

```php
TextColumn::make('name')
    ->label('Full Name')   // override auto-generated label
    ->sortable()           // show sort icon; enables server-side sorting
    ->searchable()         // include in the table's global search box
    ->hidden()             // hide from table
    ->align('right')       // 'left' | 'center' | 'right'
    ->width('200px')       // fixed column width
    ->toggleable()                   // user can show/hide this column
    ->toggleable(hiddenByDefault: true)  // hidden by default, user can enable
```

> `->searchable()` is **search** — it adds the column to the shared search box at
> the top of the table. Filtering is **not** declared on columns; add standalone
> filters to the table's filters array with `Table::filters([...])`. See
> [Table Filters](../../features/table-filters.md).

---

### Global Search (column-driven)

Mark any column `->searchable()` and the resource collects them automatically — there
is **no `$searchable` array to maintain**. The search box appears in the toolbar as
soon as at least one column is searchable, and typing runs a `LIKE` across every
searchable column.

```php
->columns([
    TextColumn::make('title')->searchable(),
    TextColumn::make('slug')->searchable(),
    TextColumn::make('author.name')->searchable(),   // searches the related table
])
```

Relationship columns (dot notation) are searched via `whereHas` on the relation, so
`author.name` matches against the related model's `name`. The legacy
`protected static array $searchable = [...]` still works and is merged in if present,
but you no longer need it.

### Inline Editing (whitelist)

Override `getInlineEditable()` on the resource to whitelist the fields that may be
edited in place (each must be backed by a form field of the same name). Only the
listed fields are accepted by the inline-edit endpoint.

```php
public static function getInlineEditable(): array
{
    return ['title', 'status'];
}
```

For a richer editable dropdown (search, relationship options, validation, lifecycle
hooks), use a `SelectColumn` in `table()` instead — see
[Select Column](select-column.md) and [Inline Editing](inline-editing.md).

### Relationship Columns

Use dot notation to display a value from a related model. The relation is eager-loaded
(no N+1), so the value renders correctly:

```php
->columns([
    TextColumn::make('category.name')->label('Category')->sortable()->searchable(),
])
```

- **Display** — the frontend resolves the dotted path (`record.category.name`).
- **Search** — handled via `whereHas` when the column is `->searchable()`.
- **Sort** — supported for single-level `belongsTo` relations via a correlated
  subquery (no joins). Other relation types render but aren't click-sortable.

### Column-scoped queries (fast & safe by default)

The index query only `SELECT`s the local columns your table actually declares (plus the
primary key, any inline-editable columns, the soft-delete column, the record-title
attribute, and the foreign keys needed for `belongsTo` relationship columns). This means
smaller, faster queries and — importantly — columns you don't display (e.g. `password`)
never leave the database. Relationship columns are eager-loaded separately. Narrowing is
skipped only for deeply nested relations (`a.b.c`), which safely fall back to selecting
all base columns.

> If a record-action `->visibleWhen()` closure reads an attribute that isn't one of your
> displayed columns, include that attribute as a column (even `->hidden()`) so it stays
> in the `SELECT`.

---

### Legacy Column API

The original `Column::*` static factories are fully supported and can be mixed with the new table builder:

```php
use Larafusion\Columns\Column;
use Larafusion\Columns\BooleanColumn;

public static function columns(): array
{
    return [
        Column::text('name')->sortable()->searchable(),
        Column::badge('status')->colors(['success' => 'published', 'warning' => 'draft']),
        BooleanColumn::make('is_active'),
        Column::date('created_at')->sortable(),
        Column::image('avatar'),
        Column::number('price')->align('right')->sortable(),
    ];
}
```

> There is no `Column::boolean()` shortcut — use `BooleanColumn::make(...)` directly. A
> static factory named `boolean` on the base `Column` class would make it impossible for
> `IconColumn` to ever declare its instance-level `->boolean()` toggle (PHP forbids
> overriding a static method as non-static).

Filtering is declared separately in the table's filters array — see
[Table Filters](filters.md).

When using `columns()` without `table()`, put sortable field names in `$sortable`:

```php
protected static array $sortable = ['name', 'created_at', 'price'];
```

---

### Filters

Filters are declared in the table's filters array via `Table::filters([...])` — they
are not declared on columns. See the dedicated **[Table Filters](filters.md)** guide
for `Filter`, `SelectFilter`, `TernaryFilter`, `DateRangeFilter`, `TrashedFilter`,
filter layouts, and session persistence.
