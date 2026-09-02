import { Component, input, output } from '@angular/core';

import { Branch } from '../../models/branch.models';

@Component({
  selector: 'app-branch-select',
  templateUrl: './branch-select.html',
})
export class BranchSelect {
  readonly branches = input.required<Branch[]>();
  readonly value = input<string | null>('');
  readonly disabled = input(false);
  readonly includeUnassigned = input(true);
  readonly valueChange = output<string | null>();
}
