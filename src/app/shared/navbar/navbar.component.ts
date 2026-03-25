import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../core/services/wishlist.service';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatBadgeModule],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-cinema-border">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2">
          <span class="text-cinema-red text-2xl font-bold tracking-wider">CINE</span>
          <span class="text-white text-2xl font-bold tracking-wider">AI</span>
        </a>

        <!-- Nav Links -->
        <div class="hidden md:flex items-center gap-8">
          <a routerLink="/home"
             routerLinkActive="nav-active"
             class="nav-link text-gray-300 text-sm font-medium">
            Home
          </a>
          <a routerLink="/explore"
             routerLinkActive="nav-active"
             class="nav-link text-gray-300 text-sm font-medium">
            Explore
          </a>
          <a routerLink="/dashboard"
             routerLinkActive="nav-active"
             class="nav-link text-gray-300 text-sm font-medium">
            Dashboard
          </a>
          <a routerLink="/wishlist"
             routerLinkActive="nav-active"
             class="nav-link text-gray-300 text-sm font-medium relative">
            Watchlist
            @if (wishlistService.wishlistCount() > 0) {
              <span class="absolute -top-2 -right-4 bg-cinema-red text-white text-xs
                           rounded-full w-4 h-4 flex items-center justify-center">
                {{ wishlistService.wishlistCount() }}
              </span>
            }
          </a>
        </div>

        <!-- Mobile menu button -->
        <button class="md:hidden text-white" (click)="toggleMenu()">
          <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>

      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="md:hidden bg-black border-t border-cinema-border px-4 py-4 flex flex-col gap-4">
          <a routerLink="/home" routerLinkActive="mobile-active" (click)="toggleMenu()"
             class="mobile-link text-gray-300 text-sm font-medium">Home</a>
          <a routerLink="/explore" routerLinkActive="mobile-active" (click)="toggleMenu()"
             class="mobile-link text-gray-300 text-sm font-medium">Explore</a>
          <a routerLink="/dashboard" routerLinkActive="mobile-active" (click)="toggleMenu()"
             class="mobile-link text-gray-300 text-sm font-medium">Dashboard</a>
          <a routerLink="/wishlist" routerLinkActive="mobile-active" (click)="toggleMenu()"
             class="mobile-link text-gray-300 text-sm font-medium">Watchlist</a>
        </div>
      }
    </nav>
  `,
  styles: [`
    .nav-link {
      position: relative;
      padding-bottom: 4px;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0%;
      height: 2px;
      background-color: #f5c518;
      border-radius: 99px;
      transition: width 0.25s ease;
    }

    .nav-link:hover {
      color: #ffffff;
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .nav-link.nav-active {
      color: #ffffff !important;
    }

    .nav-link.nav-active::after {
      width: 100%;
    }

    /* Mobile active */
    .mobile-link {
      text-decoration: none;
      transition: color 0.2s ease;
      padding-left: 8px;
      border-left: 2px solid transparent;
    }

    .mobile-link:hover {
      color: #ffffff;
    }

    .mobile-link.mobile-active {
      color: #ffffff !important;
      border-left: 2px solid #f5c518;
    }
  `]
})
export class NavbarComponent {
  menuOpen = signal(false);

  constructor(public wishlistService: WishlistService) {}

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
}