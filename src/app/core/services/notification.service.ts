import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string): Promise<unknown> {
    return Swal.fire({ icon: 'success', title: 'Listo', text: message });
  }

  error(message: string): Promise<unknown> {
    return Swal.fire({ icon: 'error', title: 'Ocurrió un problema', text: message });
  }

  confirm(message: string): Promise<boolean> {
    return Swal.fire({
      icon: 'question',
      title: 'Confirmar acción',
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => result.isConfirmed);
  }
}
