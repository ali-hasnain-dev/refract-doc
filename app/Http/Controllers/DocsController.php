<?php

namespace App\Http\Controllers;

use App\Services\Docs\DocsNavigator;
use App\Services\Docs\DocsRenderer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DocsController extends Controller
{
    public function __construct(
        private readonly DocsNavigator $navigator,
        private readonly DocsRenderer $renderer,
    ) {}

    /**
     * Redirect /docs to the first page in the navigation.
     */
    public function index(): RedirectResponse
    {
        return to_route('docs.show', ['slug' => $this->navigator->defaultSlug()]);
    }

    /**
     * Show a single documentation page.
     */
    public function show(string $slug): Response
    {
        $item = $this->navigator->find($slug);

        if ($item === null) {
            abort(404);
        }

        $page = $this->renderer->render($item['file']);
        $neighbours = $this->navigator->neighbours($slug);

        return Inertia::render('docs/show', [
            'nav' => Inertia::once(fn () => config('docs.nav')),
            'site' => Inertia::once(fn () => [
                'name' => config('docs.name'),
                'tagline' => config('docs.tagline'),
                'github' => config('docs.github'),
            ]),
            'slug' => $slug,
            'title' => $page->title,
            'excerpt' => $page->excerpt,
            'html' => $page->html,
            'toc' => $page->tableOfContents,
            'prev' => $neighbours['prev'],
            'next' => $neighbours['next'],
        ]);
    }
}
