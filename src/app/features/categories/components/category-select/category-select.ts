import { Component, input, output } from '@angular/core';

import { Category } from '../../models/category.models';

@Component({ selector: 'app-category-select', templateUrl: './category-select.html' })
export class CategorySelect {
  readonly categories = input.required<Category[]>();
  readonly value = input('');
  readonly valueChange = output<string>();
}
