import { Component, inject, signal } from '@angular/core';

import { ApiHealthService } from '../../../../core/services/api-health.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import {
  ServiceState,
  ServiceStatus,
} from '../../../../shared/ui/service-status/service-status';

@Component({
  selector: 'app-home-page',
  imports: [ServiceStatus],
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly apiHealthService = inject(ApiHealthService);

  protected readonly apiState = signal<ServiceState>('checking');
  protected readonly databaseState = signal<ServiceState>('checking');
  protected readonly environment = signal<string | null>(null);
  protected readonly message = signal('Comprobando los servicios del proyecto…');

  constructor() {
    this.checkServices();
  }

  protected checkServices(): void {
    this.apiState.set('checking');
    this.databaseState.set('checking');
    this.message.set('Comprobando los servicios del proyecto…');

    this.apiHealthService.check().subscribe({
      next: (health) => {
        this.apiState.set('available');
        this.databaseState.set('available');
        this.environment.set(health.environment);
        this.message.set('Angular, FastAPI y PostgreSQL están comunicándose correctamente.');
      },
      error: (error: ApiError) => {
        const apiResponded = error.status > 0;
        this.apiState.set(apiResponded ? 'available' : 'unavailable');
        this.databaseState.set('unavailable');
        this.message.set(
          apiResponded
            ? 'FastAPI está disponible. Crea PostgreSQL y revisa DATABASE_URL para completar la conexión.'
            : 'No se pudo contactar con FastAPI. Comprueba que el backend esté ejecutándose.',
        );
      },
    });
  }
}
