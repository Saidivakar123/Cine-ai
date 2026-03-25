import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { MovieDetail, Cast, Movie } from '../../core/models/movie.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a]">

      @if (isLoading()) {
        <div class="flex justify-center items-center h-screen">
          <mat-spinner diameter="48" color="warn"></mat-spinner>
        </div>
      }

      @if (!isLoading() && movie()) {

        <!-- Backdrop Hero -->
        <div class="relative h-[60vh] w-full overflow-hidden">
          <img
            [src]="movieService.getImageUrl(movie()!.backdrop_path, 'original')"
            [alt]="movie()!.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30"></div>

          <!-- Back Button -->
          <button
            (click)="goBack()"
            class="absolute top-6 left-6 flex items-center gap-2 text-white bg-black/50
                   backdrop-blur px-4 py-2 rounded-full hover:bg-black/80 transition-all text-sm">
            <mat-icon>arrow_back</mat-icon>
            Back
          </button>
        </div>

        <!-- Content -->
        <div class="px-4 md:px-8 lg:px-16 -mt-32 relative z-10">
          <div class="flex flex-col md:flex-row gap-8">

            <!-- Poster -->
            <div class="flex-shrink-0">
              <img
                [src]="movieService.getImageUrl(movie()!.poster_path, 'w300')"
                [alt]="movie()!.title"
                class="w-48 md:w-56 rounded-xl shadow-2xl border border-[#2a2a2a]"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 pt-32 md:pt-0 md:self-end pb-4">

              <!-- Genres -->
              <div class="flex flex-wrap gap-2 mb-3">
                @for (genre of movie()!.genres; track genre.id) {
                  <span class="px-3 py-1 bg-[#e50914]/20 border border-[#e50914]/40
                               text-[#e50914] text-xs rounded-full font-medium">
                    {{ genre.name }}
                  </span>
                }
              </div>

              <!-- Title -->
              <h1 class="text-white text-3xl md:text-5xl font-bold mb-2 leading-tight">
                {{ movie()!.title }}
              </h1>

              <!-- Tagline -->
              @if (movie()!.tagline) {
                <p class="text-gray-400 italic text-sm mb-4">"{{ movie()!.tagline }}"</p>
              }

              <!-- Stats Row -->
              <div class="flex flex-wrap items-center gap-4 mb-6">
                <div class="flex items-center gap-1">
                  <span class="text-[#f5c518] text-xl font-bold">⭐</span>
                  <span class="text-white font-bold text-xl">{{ movie()!.vote_average | number:'1.1-1' }}</span>
                  <span class="text-gray-500 text-sm">/10</span>
                </div>
                <span class="text-gray-500">|</span>
                <span class="text-gray-300 text-sm">{{ movie()!.vote_count | number }} votes</span>
                <span class="text-gray-500">|</span>
                <span class="text-gray-300 text-sm">{{ movie()!.release_date | date:'MMMM d, yyyy' }}</span>
                @if (movie()!.runtime) {
                  <span class="text-gray-500">|</span>
                  <span class="text-gray-300 text-sm">{{ movie()!.runtime }} min</span>
                }
                <span class="border border-gray-600 text-gray-400 text-xs px-2 py-0.5 rounded">
                  {{ movie()!.status }}
                </span>
              </div>

              <!-- Overview -->
              <p class="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                {{ movie()!.overview }}
              </p>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3">
                <button
                  (click)="toggleWishlist()"
                  [class]="wishlistService.isInWishlist(movie()!.id)
                    ? 'flex items-center gap-2 bg-[#e50914] text-white font-bold px-6 py-3 rounded-xl transition-all'
                    : 'flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] text-white font-bold px-6 py-3 rounded-xl hover:border-[#e50914] transition-all'">
                  <mat-icon>{{ wishlistService.isInWishlist(movie()!.id) ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                  {{ wishlistService.isInWishlist(movie()!.id) ? 'In Watchlist' : 'Add to Watchlist' }}
                </button>

                <button
                  (click)="markWatched()"
                  [class]="wishlistService.isWatched(movie()!.id)
                    ? 'flex items-center gap-2 bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-all'
                    : 'flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] text-white font-bold px-6 py-3 rounded-xl hover:border-green-500 transition-all'">
                  <mat-icon>{{ wishlistService.isWatched(movie()!.id) ? 'check_circle' : 'check_circle_outline' }}</mat-icon>
                  {{ wishlistService.isWatched(movie()!.id) ? 'Watched' : 'Mark as Watched' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          @if (movie()!.budget || movie()!.revenue) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              @if (movie()!.budget) {
                <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                  <p class="text-gray-500 text-xs mb-1">Budget</p>
                  <p class="text-white font-bold">{{ movie()!.budget | number }} USD</p>
                </div>
              }
              @if (movie()!.revenue) {
                <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                  <p class="text-gray-500 text-xs mb-1">Revenue</p>
                  <p class="text-white font-bold">{{ movie()!.revenue | number }} USD</p>
                </div>
              }
              <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                <p class="text-gray-500 text-xs mb-1">Rating</p>
                <p class="text-[#f5c518] font-bold">{{ movie()!.vote_average | number:'1.1-1' }} / 10</p>
              </div>
              <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                <p class="text-gray-500 text-xs mb-1">Runtime</p>
                <p class="text-white font-bold">{{ movie()!.runtime }} min</p>
              </div>
            </div>
          }

          <!-- Cast Section -->
          @if (cast().length > 0) {
            <div class="mt-12">
              <h2 class="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <span class="text-[#e50914]">|</span> Top Cast
              </h2>
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                @for (actor of cast().slice(0, 15); track actor.id) {
                  <div class="flex-shrink-0 w-28 text-center">
                    <div class="w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#141414] border border-[#2a2a2a] mb-2">
                      @if (actor.profile_path) {
                        <img
                          [src]="movieService.getImageUrl(actor.profile_path, 'w200')"
                          [alt]="actor.name"
                          class="w-full h-full object-cover"
                        />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center">
                          <mat-icon class="text-gray-600">person</mat-icon>
                        </div>
                      }
                    </div>
                    <p class="text-white text-xs font-medium truncate">{{ actor.name }}</p>
                    <p class="text-gray-500 text-xs truncate">{{ actor.character }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Similar Movies -->
          @if (similarMovies().length > 0) {
            <div class="mt-12 mb-16">
              <h2 class="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <span class="text-[#e50914]">|</span> Similar Movies
              </h2>
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                @for (movie of similarMovies().slice(0, 12); track movie.id) {
                  <div
                    (click)="goToMovie(movie.id)"
                    class="flex-shrink-0 w-36 cursor-pointer group">
                    <div class="relative overflow-hidden rounded-lg">
                      <img
                        [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                        [alt]="movie.title"
                        class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div class="absolute top-2 right-2 bg-black/80 text-[#f5c518] text-xs font-bold px-2 py-1 rounded">
                        ⭐ {{ movie.vote_average | number:'1.1-1' }}
                      </div>
                    </div>
                    <p class="text-white text-xs font-medium mt-2 truncate">{{ movie.title }}</p>
                    <p class="text-gray-500 text-xs">{{ movie.release_date | date:'yyyy' }}</p>
                  </div>
                }
              </div>
            </div>
          }

        </div>
      }
    </div>
  `,
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `]
})
export class DetailComponent implements OnInit {
  movie = signal<MovieDetail | null>(null);
  cast = signal<Cast[]>([]);
  similarMovies = signal<Movie[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public movieService: MovieService,
    public wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadMovie(id);
    });
  }

  loadMovie(id: number) {
    this.isLoading.set(true);
    this.movieService.getMovieDetail(id).subscribe(movie => {
      this.movie.set(movie);
      this.isLoading.set(false);
    });

    this.movieService.getMovieCredits(id).subscribe(res => {
      this.cast.set(res.cast);
    });

    this.movieService.getSimilarMovies(id).subscribe(res => {
      this.similarMovies.set(res.results);
    });
  }

  toggleWishlist() {
    const m = this.movie();
    if (!m) return;
    if (this.wishlistService.isInWishlist(m.id)) {
      this.wishlistService.removeFromWishlist(m.id);
    } else {
      this.wishlistService.addToWishlist(m);
    }
  }

  markWatched() {
    const m = this.movie();
    if (!m) return;
    this.wishlistService.markAsWatched(m);
  }

  goBack() {
    this.router.navigate(['/explore']);
  }

  goToMovie(id: number) {
    this.router.navigate(['/movie', id]);
    window.scrollTo(0, 0);
  }
}