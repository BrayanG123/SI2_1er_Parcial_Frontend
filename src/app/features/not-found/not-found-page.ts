import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main class="grid min-h-dvh place-items-center bg-stone-950 px-5 text-center text-white">
      <div>
        <p class="text-sm font-semibold tracking-[0.2em] text-rose-300 uppercase">Error 404</p>
        <h1 class="mt-4 text-4xl font-bold">Esta página no existe</h1>
        <p class="mt-4 text-stone-300">Regresa al inicio para continuar verificando el proyecto.</p>
        <a
          routerLink="/"
          class="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-stone-950 hover:bg-stone-100"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  `,
})
export class NotFoundPage {}
