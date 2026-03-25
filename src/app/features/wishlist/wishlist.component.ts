import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] px-4 md:px-8 lg:px-16 py-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-white text-3xl md:text-4xl font-bold mb-2">
          My <span class="text-[#e50914]">Watchlist</span>
        </h1>
        <p class="text-gray-400 text-sm">Track movies you want to watch and ones you've seen</p>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <p class="text-gray-500 text-xs mb-1">Want to Watch</p>
          <p class="text-white text-3xl font-bold">{{ wishlistService.wishlistCount() }}</p>
        </div>
        <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <p class="text-gray-500 text-xs mb-1">Already Watched</p>
          <p class="text-[#e50914] text-3xl font-bold">{{ wishlistService.watchedCount() }}</p>
        </div>
        <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <p class="text-gray-500 text-xs mb-1">Total Movies</p>
          <p class="text-white text-3xl font-bold">
            {{ wishlistService.wishlistCount() + wishlistService.watchedCount() }}
          </p>
        </div>
        <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <p class="text-gray-500 text-xs mb-1">Completion</p>
          <p class="text-[#f5c518] text-3xl font-bold">
            {{ completionRate() }}%
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <mat-tab-group
        animationDuration="200ms"
        [selectedIndex]="activeTab()"
        (selectedIndexChange)="activeTab.set($event)"
        class="custom-tabs">

        <!-- Watchlist Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <span class="text-sm font-medium">
              Want to Watch ({{ wishlistService.wishlistCount() }})
            </span>
          </ng-template>

          <div class="mt-6">
            @if (wishlistService.getWishlist()().length === 0) {
              <div class="flex flex-col items-center justify-center h-64 gap-4">
                <mat-icon class="text-gray-600" style="font-size:64px;width:64px;height:64px">bookmark_border</mat-icon>
                <p class="text-gray-400 text-lg">Your watchlist is empty</p>
                <p class="text-gray-600 text-sm">Browse movies and add them to your watchlist</p>
                <button
                  (click)="goToExplore()"
                  class="px-6 py-3 bg-[#e50914] text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all">
                  Browse Movies
                </button>
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (movie of wishlistService.getWishlist()(); track movie.id) {
                <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden
                            hover:border-[#e50914]/50 transition-all duration-200 group">
                  <div class="flex gap-4 p-4">

                    <!-- Poster -->
                    <img
                      [src]="movieService.getImageUrl(movie.poster_path, 'w200')"
                      [alt]="movie.title"
                      (click)="goToDetail(movie.id)"
                      class="w-16 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer
                             group-hover:opacity-80 transition-opacity"
                    />

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <h3
                        (click)="goToDetail(movie.id)"
                        class="text-white font-semibold text-sm truncate cursor-pointer hover:text-[#e50914] transition-colors mb-1">
                        {{ movie.title }}
                      </h3>
                      <p class="text-gray-500 text-xs mb-2">{{ movie.release_date | date:'yyyy' }}</p>
                      <div class="flex items-center gap-1 mb-3">
                        <span class="text-[#f5c518] text-xs">⭐</span>
                        <span class="text-gray-300 text-xs font-medium">{{ movie.vote_average | number:'1.1-1' }}</span>
                      </div>
                      <p class="text-gray-500 text-xs line-clamp-2">{{ movie.overview }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex border-t border-[#2a2a2a]">
                    <button
                      (click)="markWatched(movie)"
                      class="flex-1 flex items-center justify-center gap-2 py-3 text-gray-400
                             hover:text-green-400 hover:bg-green-400/10 transition-all text-xs font-medium">
                      <mat-icon style="font-size:16px;width:16px;height:16px">check_circle_outline</mat-icon>
                      Mark Watched
                    </button>
                    <div class="w-px bg-[#2a2a2a]"></div>
                    <button
                      (click)="removeFromWishlist(movie.id)"
                      class="flex-1 flex items-center justify-center gap-2 py-3 text-gray-400
                             hover:text-[#e50914] hover:bg-[#e50914]/10 transition-all text-xs font-medium">
                      <mat-icon style="font-size:16px;width:16px;height:16px">delete_outline</mat-icon>
                      Remove
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Watched Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <span class="text-sm font-medium">
              Watched ({{ wishlistService.watchedCount() }})
            </span>
          </ng-template>

          <div class="mt-6">
            @if (wishlistService.getWatched()().length === 0) {
              <div class="flex flex-col items-center justify-center h-64 gap-4">
                <mat-icon class="text-gray-600" style="font-size:64px;width:64px;height:64px">movie</mat-icon>
                <p class="text-gray-400 text-lg">No watched movies yet</p>
                <p class="text-gray-600 text-sm">Mark movies as watched from your watchlist or detail page</p>
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (movie of wishlistService.getWatched()(); track movie.id) {
                <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden
                            hover:border-green-500/30 transition-all duration-200 group">
                  <div class="flex gap-4 p-4">
                    <div class="relative flex-shrink-0">
                      <img
                        [src]="movieService.getImageUrl(movie.poster_path, 'w200')"
                        [alt]="movie.title"
                        (click)="goToDetail(movie.id)"
                        class="w-16 h-24 object-cover rounded-lg cursor-pointer opacity-70
                               group-hover:opacity-90 transition-opacity"
                      />
                      <!-- Watched Badge -->
                      <div class="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                        <mat-icon class="text-white" style="font-size:12px;width:12px;height:12px">check</mat-icon>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3
                        (click)="goToDetail(movie.id)"
                        class="text-white font-semibold text-sm truncate cursor-pointer hover:text-[#e50914] transition-colors mb-1">
                        {{ movie.title }}
                      </h3>
                      <p class="text-gray-500 text-xs mb-2">{{ movie.release_date | date:'yyyy' }}</p>
                      <div class="flex items-center gap-1 mb-2">
                        <span class="text-[#f5c518] text-xs">⭐</span>
                        <span class="text-gray-300 text-xs font-medium">{{ movie.vote_average | number:'1.1-1' }}</span>
                      </div>
                      <span class="inline-block px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        ✓ Watched
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>

    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    ::ng-deep .mat-mdc-tab-labels {
      background: #141414 !important;
      border-radius: 12px;
      padding: 4px;
      border: 1px solid #2a2a2a;
      display: inline-flex !important;
      width: auto !important;
    }
    ::ng-deep .mat-mdc-tab {
      color: #9ca3af !important;
    }
    ::ng-deep .mat-mdc-tab.mdc-tab--active {
      color: #ffffff !important;
    }
    ::ng-deep .mdc-tab-indicator__content--underline {
      border-color: #e50914 !important;
    }
  `]
})
export class WishlistComponent {
  activeTab = signal(0);

  completionRate = computed(() => {
    const total = this.wishlistService.wishlistCount() + this.wishlistService.watchedCount();
    if (total === 0) return 0;
    return Math.round((this.wishlistService.watchedCount() / total) * 100);
  });

  constructor(
    public wishlistService: WishlistService,
    public movieService: MovieService,
    private router: Router
  ) {}

  goToDetail(id: number) {
    this.router.navigate(['/movie', id]);
  }

  goToExplore() {
    this.router.navigate(['/explore']);
  }

  markWatched(movie: Movie) {
    this.wishlistService.markAsWatched(movie);
  }

  removeFromWishlist(id: number) {
    this.wishlistService.removeFromWishlist(id);
  }
}