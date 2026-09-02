import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { CategoriesAdminService } from '../../../categories/data-access/categories-admin.service';
import { Category } from '../../../categories/models/category.models';
import { SuppliersAdminService } from '../../../suppliers/data-access/suppliers-admin.service';
import { Supplier } from '../../../suppliers/models/supplier.models';
import { CatalogService } from '../../data-access/catalog.service';
import { Collection, Color, Product, Season, Size } from '../../models/catalog.models';

@Component({ selector: 'app-catalog-admin-page', imports: [ReactiveFormsModule], templateUrl: './catalog-admin-page.html' })
export class CatalogAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CatalogService);
  private readonly categoriesService = inject(CategoriesAdminService);
  private readonly suppliersService = inject(SuppliersAdminService);
  private readonly notifications = inject(NotificationService);
  protected readonly sizes = signal<Size[]>([]); protected readonly colors = signal<Color[]>([]);
  protected readonly seasons = signal<Season[]>([]); protected readonly collections = signal<Collection[]>([]);
  protected readonly categories = signal<Category[]>([]); protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly products = signal<Product[]>([]); protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly editingSize = signal<string | null>(null); protected readonly editingColor = signal<string | null>(null);
  protected readonly editingSeason = signal<string | null>(null); protected readonly editingCollection = signal<string | null>(null);
  protected readonly editingProduct = signal<string | null>(null);
  protected readonly editingVariant = signal<string | null>(null);

  protected readonly sizeForm = this.fb.nonNullable.group({ nombre: ['', Validators.required], orden: [0] });
  protected readonly colorForm = this.fb.nonNullable.group({ nombre: ['', Validators.required], codigo_hex: [''] });
  protected readonly seasonForm = this.fb.nonNullable.group({ nombre: ['', Validators.required], fecha_inicio: [''], fecha_fin: [''] });
  protected readonly collectionForm = this.fb.nonNullable.group({ temporada_id: ['', Validators.required], nombre: ['', Validators.required], descripcion: [''] });
  protected readonly productForm = this.fb.nonNullable.group({
    categoria_id: ['', Validators.required], proveedor_id: ['', Validators.required], temporada_id: [''], coleccion_id: [''],
    nombre: ['', [Validators.required, Validators.minLength(2)]], descripcion: [''], marca: [''], precio_base: [0, [Validators.required, Validators.min(0.01)]],
    talla_id: [''], color_id: [''], sku: [''], precio_variante: [0], imagenes: [''],
  });
  protected readonly variantForm = this.fb.nonNullable.group({ producto_id: ['', Validators.required], talla_id: ['', Validators.required], color_id: ['', Validators.required], sku: ['', Validators.required], precio: [0] });

  constructor() { this.load(); }

  protected saveSize(): void { const value = this.sizeForm.getRawValue(); this.saveMaster(this.editingSize() ? this.service.updateSize(this.editingSize()!, value) : this.service.createSize(value), () => { this.editingSize.set(null); this.sizeForm.reset({ nombre: '', orden: 0 }); }); }
  protected editSize(item: Size): void { this.editingSize.set(item.id); this.sizeForm.setValue({ nombre: item.nombre, orden: item.orden ?? 0 }); }
  protected saveColor(): void { const value = this.colorForm.getRawValue(); const data = { nombre: value.nombre, codigo_hex: value.codigo_hex || null }; this.saveMaster(this.editingColor() ? this.service.updateColor(this.editingColor()!, data) : this.service.createColor(data), () => { this.editingColor.set(null); this.colorForm.reset({ nombre: '', codigo_hex: '' }); }); }
  protected editColor(item: Color): void { this.editingColor.set(item.id); this.colorForm.setValue({ nombre: item.nombre, codigo_hex: item.codigo_hex ?? '' }); }
  protected saveSeason(): void { const value = this.seasonForm.getRawValue(); const data = { nombre: value.nombre, fecha_inicio: value.fecha_inicio || null, fecha_fin: value.fecha_fin || null, activa: true }; this.saveMaster(this.editingSeason() ? this.service.updateSeason(this.editingSeason()!, { nombre: data.nombre, fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin }) : this.service.createSeason(data), () => { this.editingSeason.set(null); this.seasonForm.reset({ nombre: '', fecha_inicio: '', fecha_fin: '' }); }); }
  protected editSeason(item: Season): void { this.editingSeason.set(item.id); this.seasonForm.setValue({ nombre: item.nombre, fecha_inicio: item.fecha_inicio ?? '', fecha_fin: item.fecha_fin ?? '' }); }
  protected saveCollection(): void { const value = this.collectionForm.getRawValue(); const data = { temporada_id: value.temporada_id, nombre: value.nombre, descripcion: value.descripcion || null }; this.saveMaster(this.editingCollection() ? this.service.updateCollection(this.editingCollection()!, data) : this.service.createCollection(data), () => { this.editingCollection.set(null); this.collectionForm.reset({ temporada_id: '', nombre: '', descripcion: '' }); }); }
  protected editCollection(item: Collection): void { this.editingCollection.set(item.id); this.collectionForm.setValue({ temporada_id: item.temporada_id, nombre: item.nombre, descripcion: item.descripcion ?? '' }); }

  protected async deleteSize(item: Size): Promise<void> { await this.confirmDelete(`la talla ${item.nombre}`, this.service.deleteSize(item.id)); }
  protected async deleteColor(item: Color): Promise<void> { await this.confirmDelete(`el color ${item.nombre}`, this.service.deleteColor(item.id)); }
  protected async deleteSeason(item: Season): Promise<void> { await this.confirmDelete(`la temporada ${item.nombre}`, this.service.deleteSeason(item.id)); }
  protected async deleteCollection(item: Collection): Promise<void> { await this.confirmDelete(`la colección ${item.nombre}`, this.service.deleteCollection(item.id)); }
  protected toggleSeason(item: Season): void { this.service.updateSeason(item.id, { activa: !item.activa }).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) }); }

  protected saveProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); return; }
    const value = this.productForm.getRawValue();
    const images = value.imagenes.split(/\r?\n/).map((url) => url.trim()).filter(Boolean).map((url, index) => ({ url, es_principal: index === 0, orden: index }));
    const common = { categoria_id: value.categoria_id, proveedor_id: value.proveedor_id, temporada_id: value.temporada_id || null, coleccion_id: value.coleccion_id || null, nombre: value.nombre, descripcion: value.descripcion || null, marca: value.marca || null, precio_base: value.precio_base, activo: true, imagenes: images };
    let request: Observable<Product>;
    if (this.editingProduct()) request = this.service.updateProduct(this.editingProduct()!, common);
    else {
      if (!value.talla_id || !value.color_id || !value.sku) { this.errorMessage.set('La primera variante requiere talla, color y SKU.'); return; }
      request = this.service.createProduct({ ...common, variantes: [{ talla_id: value.talla_id, color_id: value.color_id, sku: value.sku, precio: value.precio_variante > 0 ? value.precio_variante : null, activa: true }] });
    }
    request.subscribe({ next: () => { this.cancelProductEdit(); this.load(); }, error: (error: ApiError) => this.errorMessage.set(error.message) });
  }
  protected editProduct(item: Product): void {
    this.editingProduct.set(item.id);
    this.productForm.setValue({ categoria_id: item.categoria_id, proveedor_id: item.proveedor_id, temporada_id: item.temporada_id ?? '', coleccion_id: item.coleccion_id ?? '', nombre: item.nombre, descripcion: item.descripcion ?? '', marca: item.marca ?? '', precio_base: Number(item.precio_base), talla_id: '', color_id: '', sku: '', precio_variante: 0, imagenes: item.imagenes.map((image) => image.url).join('\n') });
  }
  protected cancelProductEdit(): void { this.editingProduct.set(null); this.productForm.reset({ categoria_id: '', proveedor_id: '', temporada_id: '', coleccion_id: '', nombre: '', descripcion: '', marca: '', precio_base: 0, talla_id: '', color_id: '', sku: '', precio_variante: 0, imagenes: '' }); }
  protected toggleProduct(item: Product): void { this.service.updateProduct(item.id, { activo: !item.activo }).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) }); }
  protected async deleteProduct(item: Product): Promise<void> { if (await this.notifications.confirm(`¿Eliminar el producto ${item.nombre}?`)) this.service.deleteProduct(item.id).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) }); }

  protected addVariant(): void {
    if (this.variantForm.invalid) { this.variantForm.markAllAsTouched(); return; }
    const value = this.variantForm.getRawValue();
    const data = { talla_id: value.talla_id, color_id: value.color_id, sku: value.sku, precio: value.precio > 0 ? value.precio : null, activa: true };
    const request = this.editingVariant()
      ? this.service.updateVariant(this.editingVariant()!, data)
      : this.service.createVariant(value.producto_id, data);
    request.subscribe({ next: () => { this.cancelVariantEdit(); this.load(); }, error: (error: ApiError) => this.errorMessage.set(error.message) });
  }
  protected editVariant(product: Product, item: Product['variantes'][number]): void { this.editingVariant.set(item.id); this.variantForm.setValue({ producto_id: product.id, talla_id: item.talla_id, color_id: item.color_id, sku: item.sku, precio: Number(item.precio ?? 0) }); }
  protected cancelVariantEdit(): void { this.editingVariant.set(null); this.variantForm.reset({ producto_id: '', talla_id: '', color_id: '', sku: '', precio: 0 }); }
  protected toggleVariant(item: Product['variantes'][number]): void { this.service.updateVariant(item.id, { activa: !item.activa }).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) }); }
  protected async deleteVariant(item: Product['variantes'][number]): Promise<void> { if (await this.notifications.confirm(`¿Eliminar la variante ${item.sku}?`)) this.service.deleteVariant(item.id).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) }); }
  protected collectionsForSelectedSeason(): Collection[] { const seasonId = this.productForm.controls.temporada_id.value; return this.collections().filter((item) => item.temporada_id === seasonId); }

  private saveMaster(request: Observable<unknown>, reset: () => void): void { request.subscribe({ next: () => { reset(); this.load(); }, error: (error: ApiError) => this.errorMessage.set(error.message) }); }
  private async confirmDelete(label: string, request: Observable<void>): Promise<void> { if (await this.notifications.confirm(`¿Eliminar ${label}?`)) request.subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) }); }
  private load(): void {
    this.loading.set(true);
    forkJoin({ sizes: this.service.listSizes(), colors: this.service.listColors(), seasons: this.service.listSeasons(), collections: this.service.listCollections(), categories: this.categoriesService.list(1, 100), suppliers: this.suppliersService.list(1, 100), products: this.service.listAdminProducts() }).subscribe({
      next: (data) => { this.sizes.set(data.sizes); this.colors.set(data.colors); this.seasons.set(data.seasons); this.collections.set(data.collections); this.categories.set(data.categories.items); this.suppliers.set(data.suppliers.items); this.products.set(data.products.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }
}
