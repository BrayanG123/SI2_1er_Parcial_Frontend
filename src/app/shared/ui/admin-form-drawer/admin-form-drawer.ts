import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-form-drawer',
  imports: [FontAwesomeModule],
  templateUrl: './admin-form-drawer.html',
})
export class AdminFormDrawer {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly closed = output<void>();
  protected readonly faXmark = faXmark;
}
