import { computed, Injectable, signal } from '@angular/core';

import { ReservationDraftItem } from '../models/reservation.models';

const STORAGE_KEY = 'ropa_reservation_draft';

@Injectable({ providedIn: 'root' })
export class ReservationDraftService {
  private readonly draft = signal<ReservationDraftItem[]>(this.read());
  readonly items = this.draft.asReadonly();
  readonly totalUnits = computed(() =>
    this.draft().reduce((total, item) => total + item.cantidad, 0),
  );
  readonly branchId = computed(() => this.draft()[0]?.sucursal_id ?? null);

  add(item: Omit<ReservationDraftItem, 'cantidad'>): 'added' | 'different_branch' | 'stock_limit' {
    const current = this.draft();
    if (current.length > 0 && current[0].sucursal_id !== item.sucursal_id) {
      return 'different_branch';
    }
    const existing = current.find((candidate) => candidate.variante_id === item.variante_id);
    if (existing && existing.cantidad >= item.stock_disponible) return 'stock_limit';
    const next = existing
      ? current.map((candidate) =>
          candidate.variante_id === item.variante_id
            ? { ...candidate, cantidad: candidate.cantidad + 1, stock_disponible: item.stock_disponible }
            : candidate,
        )
      : [...current, { ...item, cantidad: 1 }];
    this.save(next);
    return 'added';
  }

  setQuantity(variantId: string, quantity: number): void {
    const next = this.draft().map((item) =>
      item.variante_id === variantId
        ? { ...item, cantidad: Math.max(1, Math.min(quantity, item.stock_disponible)) }
        : item,
    );
    this.save(next);
  }

  remove(variantId: string): void {
    this.save(this.draft().filter((item) => item.variante_id !== variantId));
  }

  clear(): void {
    this.save([]);
  }

  private save(items: ReservationDraftItem[]): void {
    this.draft.set(items);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private read(): ReservationDraftItem[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ReservationDraftItem[]) : [];
    } catch {
      return [];
    }
  }
}
