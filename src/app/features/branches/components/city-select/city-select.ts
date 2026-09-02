import { Component, input, output } from '@angular/core';

import { City } from '../../models/branch.models';

@Component({
  selector: 'app-city-select',
  templateUrl: './city-select.html',
})
export class CitySelect {
  readonly cities = input.required<City[]>();
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();
}
