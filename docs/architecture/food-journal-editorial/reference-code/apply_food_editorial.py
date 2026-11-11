#!/usr/bin/env python3
"""Conservative, reversible presentation-only adaptation of Bloom Food pages.

Run at repository root: python3 path/to/apply_food_editorial.py
Refuses any unexpected baseline markup; never changes hooks, API calls or callbacks.
"""
from pathlib import Path
import sys

ROOT = Path.cwd()
CSS_SRC = Path(__file__).resolve().parent.parent / 'files' / 'food-editorial.css'
CSS_DEST = ROOT / 'client/src/styles/food-editorial.css'


def apply(path: str, edits: list[tuple[str, str]]):
    target = ROOT / path
    if not target.is_file():
        raise RuntimeError(f'Missing file: {target}')
    original = target.read_text(encoding='utf-8')
    current = original
    for before, after in edits:
        if after in current:
            # Already patched; do not change this block twice.
            continue
        found = current.count(before)
        if found != 1:
            raise RuntimeError(f'{path}: expected exact anchor once, found {found}: {before[:85]!r}')
        current = current.replace(before, after, 1)
    if current != original:
        target.write_text(current, encoding='utf-8')
        print(f'Updated {path}')
    else:
        print(f'Already up to date: {path}')


def edits_log():
    return [
        ('import { bloomCopy } from "@/content/bloomCopy";',
         'import "@/styles/food-editorial.css";\nimport { bloomCopy } from "@/content/bloomCopy";'),
        ('    <main className="meal-page">\n      <Link href="/"',
         '    <main className="meal-page bloom-food-editorial bloom-food-composer">\n      <Link href="/"'),
        ('<div className="meal-page-heading">', '<div className="meal-page-heading bloom-food-page-heading">'),
        ('<section className="bloom-panel saved-meal" role="status">',
         '<section className="bloom-panel saved-meal bloom-food-confirmation" role="status">'),
        ('className="bloom-panel space-y-6"\n        onSubmit=',
         'className="bloom-panel space-y-6 bloom-food-form"\n        onSubmit='),
        ('<details className="bloom-panel" open={toolsOpen}',
         '<details className="bloom-panel bloom-food-tools" open={toolsOpen}'),
        ('<section className="bloom-panel space-y-4 meal-review" aria-labelledby="meal-review-heading">',
         '<section className="bloom-panel space-y-4 meal-review bloom-food-review" aria-labelledby="meal-review-heading">'),
    ]


def edits_history():
    return [
        ('import {useLocation} from "wouter";',
         'import "@/styles/food-editorial.css";\nimport {useLocation} from "wouter";'),
        ('    <main className="science-page journal-page">',
         '    <main className="science-page journal-page bloom-food-editorial bloom-food-history">'),
        ('<div className="science-heading">\n        <p className="eyebrow">YOUR DAILY RECORD</p>',
         '<div className="science-heading bloom-food-page-heading">\n        <p className="eyebrow">YOUR DAILY RECORD</p>'),
        ('<div className="journal-workspace">', '<div className="journal-workspace bloom-food-journal">'),
        ('<Card className="mb-6 min-w-0 [overflow-wrap:anywhere]" data-testid="card-daily-summary">',
         '<Card className="mb-6 min-w-0 [overflow-wrap:anywhere] bloom-food-summary" data-testid="card-daily-summary">'),
        ('<Card id={`journal-meal-${meal.id}`} key={meal.id} data-testid={`card-meal-${index}`}>',
         '<Card id={`journal-meal-${meal.id}`} key={meal.id} className="bloom-food-meal-row" data-testid={`card-meal-${index}`}>'),
        ('<Card data-testid="card-monthly-averages">',
         '<Card className="bloom-food-history-panel" data-testid="card-monthly-averages">'),
        ('<Card data-testid="card-yearly-overview">',
         '<Card className="bloom-food-history-panel" data-testid="card-yearly-overview">'),
        ('<details className="bloom-panel workspace-disclosure mb-6">',
         '<details className="bloom-panel workspace-disclosure mb-6 bloom-food-trends">'),
    ]


def main():
    targets = [(ROOT / 'client/src/pages/LogMeal.tsx', edits_log()),
               (ROOT / 'client/src/pages/NutritionHistory.tsx', edits_history())]
    # Preflight everything before writing a single file.
    for target, changes in targets:
        if not target.exists():
            raise RuntimeError(f'Missing {target}; run from Bloom repository root.')
        content = target.read_text(encoding='utf-8')
        for before, after in changes:
            if after not in content and content.count(before) != 1:
                raise RuntimeError(f'Preflight stopped: {target.name}, anchor {before[:85]!r}')
    if CSS_DEST.exists() and CSS_DEST.read_bytes() != CSS_SRC.read_bytes():
        raise RuntimeError(f'Existing stylesheet differs: {CSS_DEST}; reconcile manually.')
    for target, changes in targets:
        apply(str(target.relative_to(ROOT)), changes)
    CSS_DEST.parent.mkdir(parents=True, exist_ok=True)
    CSS_DEST.write_bytes(CSS_SRC.read_bytes())
    print('Installed '+str(CSS_DEST.relative_to(ROOT)))
    print('Review git diff; then run project typecheck, tests and browser QA.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('Stopped safely: '+str(exc), file=sys.stderr)
        sys.exit(1)