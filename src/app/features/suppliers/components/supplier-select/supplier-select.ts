import { Component, input, output } from '@angular/core';

import { Supplier } from '../../models/supplier.models';

@Component({ selector: 'app-supplier-select', templateUrl: './supplier-select.html' })
export class SupplierSelect {
  readonly suppliers = input.required<Supplier[]>();
  readonly value = input('');
  readonly valueChange = output<string>();
}
