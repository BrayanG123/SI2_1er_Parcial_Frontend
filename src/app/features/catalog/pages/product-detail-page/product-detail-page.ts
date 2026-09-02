import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiError } from '../../../../shared/models/api-error.model';
import { CatalogService } from '../../data-access/catalog.service';
import { Product, ProductAvailability } from '../../models/catalog.models';

@Component({ selector: 'app-product-detail-page', imports: [RouterLink, CurrencyPipe], templateUrl: './product-detail-page.html' })
export class ProductDetailPage {
  private readonly service = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  protected readonly product = signal<Product | null>(null);
  protected readonly availability = signal<ProductAvailability[]>([]);
  protected readonly selectedImage = signal('');
  protected readonly selectedSize = signal('');
  protected readonly selectedColor = signal('');
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly sizes = computed(() => {
    const values = this.product()?.variantes.map((item) => item.talla) ?? [];
    return values.filter((item, index) => values.findIndex((candidate) => candidate.id === item.id) === index);
  });
  protected readonly colors = computed(() => {
    const variants = this.product()?.variantes.filter((item) => !this.selectedSize() || item.talla_id === this.selectedSize()) ?? [];
    const values = variants.map((item) => item.color);
    return values.filter((item, index) => values.findIndex((candidate) => candidate.id === item.id) === index);
  });
  protected readonly variant = computed(() => this.product()?.variantes.find((item) => item.talla_id === this.selectedSize() && item.color_id === this.selectedColor()) ?? null);
  protected readonly selectedAvailability = computed(() => {
    const variantId = this.variant()?.id;
    return variantId
      ? this.availability().filter((item) => item.variante_id === variantId)
      : [];
  });
  protected readonly totalAvailable = computed(() =>
    this.selectedAvailability().reduce((sum, item) => sum + item.stock_disponible, 0),
  );

  constructor() {
    const productId = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      product: this.service.getPublicProduct(productId),
      availability: this.service.getPublicAvailability(productId),
    }).subscribe({
      next: ({ product, availability }) => { this.product.set(product); this.availability.set(availability); this.selectedImage.set(product.imagenes.find((item) => item.es_principal)?.url ?? product.imagenes[0]?.url ?? ''); this.selectedSize.set(product.variantes[0]?.talla_id ?? ''); this.selectedColor.set(product.variantes[0]?.color_id ?? ''); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }
  protected selectSize(id: string): void { this.selectedSize.set(id); const first = this.product()?.variantes.find((item) => item.talla_id === id); this.selectedColor.set(first?.color_id ?? ''); }
  protected effectivePrice(): number { const product = this.product(); return this.variant()?.precio ?? product?.precio_base ?? 0; }
}
