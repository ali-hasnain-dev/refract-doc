# Inline Editing

## Inline Editing

Allow specific fields to be edited directly in the table without opening the edit page.

Declare the whitelist by overriding `getInlineEditable()` on the resource — only the
listed fields are accepted by the inline-edit endpoint:

```php
public static function getInlineEditable(): array
{
    return ['title', 'price', 'is_active'];
}
```

Each inline-editable field must be backed by a form field of the same name (that's what
renders the inline editor). Click any cell in those columns to edit in place; press
**Enter** or click away to save via `PATCH /admin/{resource}/{id}/inline`.

For a richer, self-contained editable dropdown (search, relationship options, validation,
and lifecycle hooks) use a `SelectColumn` in your `table()` instead — it has its own
endpoints and does not rely on the `getInlineEditable()` whitelist. See
[Select Column](select-column.md).

---
