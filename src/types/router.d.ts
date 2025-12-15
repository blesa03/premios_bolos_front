// Type augmentation: add `renderMode` to Angular `Route` type
import '@angular/router';

declare module '@angular/router' {
  interface Route {
    renderMode?: 'client' | 'server';
  }
}
