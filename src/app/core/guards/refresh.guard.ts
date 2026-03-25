import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RefreshGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (!sessionStorage.getItem('app_loaded')) {
      sessionStorage.setItem('app_loaded', 'true');
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}