import { Component, input } from '@angular/core';

export type ServiceState = 'checking' | 'available' | 'unavailable';

@Component({
  selector: 'app-service-status',
  templateUrl: './service-status.html',
})
export class ServiceStatus {
  readonly label = input.required<string>();
  readonly description = input.required<string>();
  readonly state = input.required<ServiceState>();

  protected stateLabel(): string {
    switch (this.state()) {
      case 'checking':
        return 'Comprobando';
      case 'available':
        return 'Disponible';
      case 'unavailable':
        return 'No disponible';
    }
  }
}
