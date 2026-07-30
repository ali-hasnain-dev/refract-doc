# Toggle Column

`ToggleColumn` renders an inline-editable switch directly in a table cell. The user
flips a boolean in place — no navigation, no full table reload — and the change is
saved with a single `PATCH` request that updates only that one row.

```php
use Larafusion\Columns\ToggleColumn;
use Larafusion\Tables\Table;

public static function table(Table $table): Table
{
    return $table->columns([
        ToggleColumn::make('is_active'),
    ]);
}
```

Everything is enforced on the server. The identity of the column being edited, the
authorization, the boolean validation, and the lifecycle hooks are all re-derived
server-side from an encrypted token — the browser is never trusted.

---

## Storing the state

The column reads and writes the record attribute named in `make()`. Cast it to
`boolean` on your model for clean `true`/`false` values:

```php
protected $casts = ['is_active' => 'boolean'];
```

`default()` sets the value used when the record has no stored state:

```php
ToggleColumn::make('is_active')->default(true);
```

---

## Lifecycle hooks

Run logic around the save. Utilities are injected by parameter name or type, so
declare only what you need (`$record`, `$state`, `$old`, `$set`, `$get`).

`beforeStateUpdated` runs **before** persistence and can **abort** the toggle by
returning `false` (or throwing) — nothing is written and the switch rolls back:

```php
ToggleColumn::make('is_published')
    ->beforeStateUpdated(function ($record, $state) {
        // Prevent publishing a post that isn't ready.
        if ($state === true && ! $record->is_ready) {
            return false; // abort — the switch snaps back
        }
    });
```

`afterStateUpdated` runs **only after a successful save**. If it throws, the whole
operation rolls back (it runs inside the same transaction as the write) and the
client is told to roll back too:

```php
ToggleColumn::make('is_active')
    ->afterStateUpdated(function ($record, $state, $old) {
        activity()->performedOn($record)->log("Active: {$old} → {$state}");
    });
```

---

## Customizing the color

Set the track color for the on and off states (`primary`, `success`, `warning`,
`danger`, `info`, `gray`):

```php
ToggleColumn::make('is_active')
    ->onColor('success')
    ->offColor('danger');
```

---

## Customizing the icon

Show a lucide icon inside the knob for each state:

```php
ToggleColumn::make('is_active')
    ->onIcon('check')
    ->offIcon('x');
```

---

## Disabling

Disable the switch entirely, or conditionally per record. A disabled toggle renders
read-only and can never be written — the server rejects a crafted request too:

```php
ToggleColumn::make('is_active')->disabled();

ToggleColumn::make('is_active')->disabled(fn ($record) => $record->is_locked);
```

---

## Validation

A toggle always validates as a boolean; add your own rules on top:

```php
ToggleColumn::make('is_active')
    ->rules(['required'])
    ->validationMessages(['boolean' => 'The active flag must be true or false.']);
```

The client receives a display-safe subset; the server always re-validates with the
full set (a missing or non-boolean value is rejected).

---

## Behaviour on the client

- **Optimistic** — the switch flips immediately; on failure it rolls back to the
  previous state and shows an error toast.
- **Per-cell loading** — a spinner appears in the knob while saving.
- **Deduplicated** — rapid clicks are ignored while a save is in flight, so a
  double-click never fires two requests.
- **Isolated** — only the affected row updates. There is no full-table refresh and
  no Inertia reload.
- **Accessible** — a `role="switch"` control with `aria-checked` / `aria-busy`, a
  visible focus ring, and native keyboard operation (Enter / Space).

---

## Security model

- Each cell carries an **encrypted identity token** (`{resource, column}`), bound to
  your `APP_KEY`. The client cannot name a different table or column.
- The `PATCH` handler re-runs `canEdit()` authorization, re-checks the disabled
  state, validates the boolean, runs `beforeStateUpdated` (which may abort), persists
  only the target attribute inside a transaction, then runs `afterStateUpdated` —
  independently of anything the browser did.

### Endpoint

| Method | Path                   | Purpose               |
| ------ | ---------------------- | --------------------- |
| PATCH  | `/admin/toggle-column` | Persist the new state |

---

## Related

- [Tables Overview](overview.md)
- [Select Column](select-column.md) — inline-editable select cells
- [Inline Editing](inline-editing.md) — whitelist-based cell editing
