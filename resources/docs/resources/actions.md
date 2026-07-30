# Actions

## Actions

Larafusion has three action layers:

| Layer                                                       | Where defined                | When to use                                                |
| ----------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| **Built-in actions** (EditAction, DeleteAction, ViewAction) | `->recordActions()` on Table | Standard navigate/delete per row                           |
| **Custom inline actions** (`Action::make()`)                | `->recordActions()` on Table | Any server callback or URL navigation — preferred approach |
| **Legacy custom actions** (ButtonAction / LinkAction)       | `actions()` on Resource      | Backward-compatible; still supported                       |

See [Built-in Record Actions](#built-in-record-actions) and [Custom Action (Filament-style)](#custom-action-filament-style) above for the primary approach.

### Action Reference

The full method set shared by `Action`, `ButtonAction`, and `LinkAction`:

### Available Icons

`eye` · `pencil/edit` · `trash/delete` · `check/approve` · `x/close/reject` · `plus/add` · `download/export` · `upload/import` · `refresh` · `restore` · `external-link/open` · `link` · `zap` · `star/favourite` · `copy/duplicate` · `send` · `mail/email` · `user/profile` · `settings/gear` · `archive` · `bell/notify` · `shield`

### Display Modes

| Method         | Renders as                              |
| -------------- | --------------------------------------- |
| `->iconOnly()` | Icon-only button with tooltip (default) |
| `->textOnly()` | Text label only                         |
| `->button()`   | Pill button with icon + label           |

---

### Legacy Custom Actions (ButtonAction / LinkAction)

For backward compatibility, per-record custom actions can also be defined via `actions()` on the resource. These are rendered alongside any `recordActions()`.

```php
use Larafusion\Actions\ButtonAction;
use Larafusion\Actions\LinkAction;

public static function actions(): array
{
    return [
        // Server-side action
        ButtonAction::make('approve')
            ->label('Approve')
            ->icon('check')
            ->color('success')
            ->button()
            ->confirm('Approve this record?')
            ->visibleWhen(fn ($r) => $r->status === 'pending')
            ->using(fn ($record) => $record->update(['status' => 'approved']))
            ->successMessage('Approved!')
            ->redirectTo('/admin/posts'),

        // Client-side link
        LinkAction::make('preview')
            ->label('Preview')
            ->icon('eye')
            ->url(fn ($record) => "/blog/{$record->slug}")
            ->openInNewTab(),
    ];
}
```

**ButtonAction-specific methods:**

| Method                         | Description              |
| ------------------------------ | ------------------------ |
| `->using(fn($record) => ...)`  | Handler callback         |
| `->successMessage('...')`      | Flash message on success |
| `->redirectTo('/url')`         | Redirect after success   |
| `->visibleWhen(fn($r) => ...)` | Conditional visibility   |
| `->confirm('...')`             | Confirmation dialog      |

**LinkAction-specific methods:**

| Method                                    | Description               |
| ----------------------------------------- | ------------------------- |
| `->url('/url')` or `->url(fn($r) => ...)` | Target URL                |
| `->openInNewTab()`                        | Open in a new browser tab |

> **Recommendation:** Use `Action::make()` inside `->recordActions()` for new resources. `ButtonAction` / `LinkAction` remain fully supported for existing code.

---

## Page Header Actions

Separate from table row actions above, `Larafusion\Pages\Actions\*` are the
buttons rendered in the breadcrumb/header area of a resource's List, Create,
Edit, and Show pages — "New Post" on the list page, "Delete" on the edit
page, and so on. Each Page class (`ListPage`, `CreatePage`, `EditPage`,
`ShowPage`) exposes a `getHeaderActions(): array` you can override, exactly
the same add-or-remove model as table `recordActions()`:

```php
namespace App\Larafusion\Resources\Posts\Pages;

use Larafusion\Pages\EditPage;
use Larafusion\Pages\Actions\ViewAction;
use Larafusion\Pages\Actions\DeleteAction;
use App\Larafusion\Resources\Posts\PostResource;

class EditPost extends EditPage
{
    protected static string $resource = PostResource::class;

    public static function getHeaderActions(): array
    {
        return [
            ViewAction::make(),      // link back to the read-only info page
            DeleteAction::make()->label('Remove'),
        ];
    }
}
```

Available actions:

| Class               | Default appears on                                 | Description                                            |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| `CreateAction`      | `ListPage`                                         | "New {Record}" button linking to the create page       |
| `EditAction`        | — (add to `ShowPage`)                              | Links to the edit page                                 |
| `ViewAction`        | — (add to `EditPage`)                              | Links back to the read-only show/info page             |
| `DeleteAction`      | `EditPage`                                         | Deletes the current record, with a confirmation dialog |
| `RestoreAction`     | — (add to `EditPage` for soft-deletable resources) | Restores a trashed record                              |
| `ForceDeleteAction` | — (add to `EditPage` for soft-deletable resources) | Permanently deletes a trashed record                   |

Every action supports `->label()`, `->color()`, and `->icon()`; most also
support `->requiresConfirmation('message')`. Omit an action entirely to
remove that button — there's no separate "hide" flag, the array itself is the
source of truth. `ViewAction`/`EditAction` link to
`/admin/{resource}/{id}` and `/admin/{resource}/{id}/edit` respectively and
render regardless of whether a dedicated `Pages\ShowX`/`Pages\EditX` class
exists — both routes always render generically otherwise.

---
