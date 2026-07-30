<?php

use App\Http\Controllers\DocsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome', [
    'nav' => config('docs.nav'),
    'site' => [
        'name' => config('docs.name'),
        'tagline' => config('docs.tagline'),
        'github' => config('docs.github'),
    ],
])->name('home');

Route::get('docs', [DocsController::class, 'index'])->name('docs.index');
Route::get('docs/{slug}', [DocsController::class, 'show'])
    ->where('slug', '.*')
    ->name('docs.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
