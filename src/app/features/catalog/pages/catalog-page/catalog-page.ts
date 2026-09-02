import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiError } from '../../../../shared/models/api-error.model';
import { Category } from '../../../categories/models/category.models';
import { CatalogService } from '../../data-access/catalog.service';
import { Color, Product, ProductFilters, Season, Size } from '../../models/catalog.models';

@Component({ selector: 'app-catalog-page', imports: [ReactiveFormsModule, RouterLink, CurrencyPipe], templateUrl: './catalog-page.html' })
export class CatalogPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly seasons = signal<Season[]>([]);
  protected readonly sizes = signal<Size[]>([]);
  protected readonly colors = signal<Color[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly page = signal(Number(this.route.snapshot.queryParamMap.get('page')) || 1);
  protected readonly total = signal(0);
  protected readonly pageSize = 12;
  protected readonly filters = this.fb.nonNullable.group({
    q: [this.route.snapshot.queryParamMap.get('q') ?? ''],
    category_id: [this.route.snapshot.queryParamMap.get('category_id') ?? ''],
    season_id: [this.route.snapshot.queryParamMap.get('season_id') ?? ''],
    size_id: [this.route.snapshot.queryParamMap.get('size_id') ?? ''],
    color_id: [this.route.snapshot.queryParamMap.get('color_id') ?? ''],
  });

  constructor() {
    forkJoin({ categories: this.service.listPublicCategories(), seasons: this.service.listPublicSeasons(), sizes: this.service.listPublicSizes(), colors: this.service.listPublicColors() }).subscribe({
      next: (options) => { this.categories.set(options.categories); this.seasons.set(options.seasons); this.sizes.set(options.sizes); this.colors.set(options.colors); },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
    this.load();
  }

  protected applyFilters(): void { this.page.set(1); this.syncUrl(); this.load(); }
  protected clearFilters(): void { this.filters.reset({ q: '', category_id: '', season_id: '', size_id: '', color_id: '' }); this.applyFilters(); }
  protected changePage(delta: number): void { this.page.update((value) => value + delta); this.syncUrl(); this.load(); }
  protected hasNext(): boolean { return this.page() * this.pageSize < this.total(); }
  protected mainImage(product: Product): string | null { return product.imagenes.find((image) => image.es_principal)?.url ?? product.imagenes[0]?.url ?? null; }
  protected price(product: Product): number { return Math.min(product.precio_base, ...product.variantes.map((variant) => variant.precio ?? product.precio_base)); }

  private currentFilters(): ProductFilters {
    const value = this.filters.getRawValue();
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item)) as ProductFilters;
  }
  private syncUrl(): void { void this.router.navigate([], { relativeTo: this.route, queryParams: { ...this.currentFilters(), page: this.page() } }); }
  private load(): void {
    this.loading.set(true);
    this.service.listPublicProducts(this.page(), this.pageSize, this.currentFilters()).subscribe({
      next: (response) => { this.products.set(response.items); this.total.set(response.total); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }
}
