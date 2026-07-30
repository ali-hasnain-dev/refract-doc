# Larafusion Documentation

Documentation is organised by area. Pick a section below, or browse the folders
directly.

## Start here

- [Getting Started](getting-started.md) — requirements, installation, folder structure
- [CLI Commands](cli-commands.md) — `larafusion:install`, `:resource`, `:widget`, and friends
- [Enums](enums.md) — first-class PHP enum support across forms, tables, and filters
- [Upgrade Guide](upgrade.md) — version-to-version upgrade notes

## Resources — [`resources/`](resources/)

- [Resources](resources/overview.md) — model → CRUD mapping, auto-discovery, resource options
- [Actions](resources/actions.md) — per-row actions (inline, URL, legacy ButtonAction)
- [Soft Deletes](resources/soft-deletes.md) — trashed tab, restore, force-delete

## Forms — [`forms/`](forms/)

- [Forms](forms/overview.md) — 20+ field types, validation, layout, custom fields

## Tables — [`tables/`](tables/)

- [Overview](tables/overview.md) — table builder, record/bulk actions, common column methods, relationships
- [Filters](tables/filters.md) — `SelectFilter`, `TernaryFilter`, `DateRangeFilter`, layouts, persistence
- [Inline Editing](tables/inline-editing.md) — click-to-edit table cells
- [Global Search](tables/global-search.md) — ⌘K search palette
- [Export & Import](tables/export-import.md) — CSV export and the 3-step import wizard

Column types:

- [TextColumn](tables/text-column.md) — text, truncation, badges, money, prefixes/suffixes
- [BadgeColumn](tables/badge-column.md) — coloured pill badges from values or enums
- [BooleanColumn](tables/boolean-column.md) — true/false icon in a semantic color
- [DateColumn](tables/date-column.md) — formatted or relative dates
- [ImageColumn](tables/image-column.md) — avatars/thumbnails, circular or stacked
- [IconColumn](tables/icon-column.md) — value→icon mapping, or boolean check/x
- [SelectColumn](tables/select-column.md) — inline-editable select cell
- [ToggleColumn](tables/toggle-column.md) — inline-editable boolean switch

## Infolists — [`infolists/`](infolists/)

- [Overview](infolists/overview.md) — read-only Infolist builder, base Entry API, relationships, serialization
- [Layout](infolists/layout.md) — `Section`, `Grid`, `Tabs`, `Fieldset`, `Split`, `Group`

Entry types:

- [TextEntry](infolists/text-entry.md) — text, badges, colors, weight, prefixes/suffixes, money, enums
- [IconEntry](infolists/icon-entry.md) — value→icon mapping, or boolean check/x
- [ImageEntry](infolists/image-entry.md) — avatars/thumbnails, single image or a small gallery
- [ColorEntry](infolists/color-entry.md) — a swatch plus the raw color value
- [CodeEntry](infolists/code-entry.md) — syntax-highlighted, monospaced code blocks
- [KeyValueEntry](infolists/key-value-entry.md) — a one-dimensional associative array/JSON object as a key/value table
- [RepeatableEntry](infolists/repeatable-entry.md) — repeats a nested schema per array/JSON/relationship item, card or table layout

## Widgets — [`widgets/`](widgets/)

- [Widgets](widgets/overview.md) — Stats, Chart (SVG), and Table widgets for the dashboard

## Panels — [`panels/`](panels/)

- [Panel Configuration](panels/overview.md) — auth, branding, layout, user menu, prefetch
- [Navigation](panels/navigation.md) — groups, badges, custom pages, modal forms
- [Themes](panels/themes.md) — built-in themes, dark mode, FOUC prevention
- [Plugins](panels/plugins.md) — nav items, slots, lifecycle hooks

## Notifications — [`notifications/`](notifications/)

- [Notifications](notifications/overview.md) — flash toasts and the `useNotify()` React hook

## Reference & internals

- [HTTP Endpoints](internals.md) — full route table and Inertia v3 data-flow internals
- [Feature Roadmap](roadmap.md) — completed features and what's planned next
- [Monorepo Split](monorepo-split.md) — how packages are split into standalone repos

---

Feature specs and design notes live in [`../features/`](../features/); this folder
is the user-facing guide.
