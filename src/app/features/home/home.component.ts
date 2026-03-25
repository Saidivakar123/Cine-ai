import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Movie } from '../../core/models/movie.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a]">

      <!-- HERO SECTION -->
      @if (heroMovie()) {
        <div class="relative h-[90vh] w-full overflow-hidden">

          <!-- Backdrop Image -->
          <img
            [src]="movieService.getImageUrl(heroMovie()!.backdrop_path, 'original')"
            [alt]="heroMovie()!.title"
            class="w-full h-full object-cover"
          />

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

          <!-- Hero Content -->
          <div class="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl">

            <!-- Badge -->
            <span class="inline-block bg-[#e50914] text-white text-xs font-bold px-3 py-1 rounded mb-4 tracking-widest uppercase">
              🔥 Trending This Week
            </span>

            <!-- Title -->
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {{ heroMovie()!.title }}
            </h1>

            <!-- Rating + Year -->
            <div class="flex items-center gap-4 mb-4">
              <span class="text-[#f5c518] font-bold text-lg">
                ⭐ {{ heroMovie()!.vote_average | number:'1.1-1' }}
              </span>
              <span class="text-gray-400 text-sm">
                {{ heroMovie()!.release_date | date:'yyyy' }}
              </span>
              <span class="border border-gray-500 text-gray-400 text-xs px-2 py-0.5 rounded">
                HD
              </span>
            </div>

            <!-- Overview -->
            <p class="text-gray-300 text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
              {{ heroMovie()!.overview }}
            </p>

            <!-- Buttons -->
            <div class="flex items-center gap-4">
              <button
                (click)="goToDetail(heroMovie()!.id)"
                class="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200">
                <mat-icon>play_arrow</mat-icon>
                View Details
              </button>
              <button
                (click)="toggleWishlist(heroMovie()!)"
                class="flex items-center gap-2 bg-white/20 backdrop-blur text-white font-bold px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30">
                <mat-icon>{{ wishlistService.isInWishlist(heroMovie()!.id) ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                {{ wishlistService.isInWishlist(heroMovie()!.id) ? 'Saved' : 'Watchlist' }}
              </button>
            </div>
          </div>

          <!-- Hero Nav Dots -->
          <div class="absolute bottom-8 right-8 md:right-16 flex gap-2">
            @for (movie of trendingMovies().slice(0, 5); track movie.id; let i = $index) {
              <button
                (click)="setHero(i)"
                [class]="heroIndex() === i
                  ? 'w-8 h-2 bg-[#e50914] rounded-full transition-all'
                  : 'w-2 h-2 bg-white/40 rounded-full transition-all hover:bg-white/70'">
              </button>
            }
          </div>
        </div>
      }

      <!-- LOADING HERO -->
      @if (!heroMovie() && isLoading()) {
        <div class="h-[90vh] bg-[#141414] animate-pulse flex items-center justify-center">
          <span class="text-gray-600 text-xl">Loading CineAI...</span>
        </div>
      }

      <!-- MOVIE SECTIONS -->
      <div class="px-4 md:px-8 lg:px-16 py-8 space-y-12">

        <!-- Trending -->
        <section>
          <h2 class="text-white text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="text-[#e50914]">|</span> Trending This Week
          </h2>
          <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            @for (movie of trendingMovies(); track movie.id) {
              <div
                (click)="goToDetail(movie.id)"
                class="flex-shrink-0 w-40 md:w-48 cursor-pointer group">
                <div class="relative overflow-hidden rounded-lg">
                  <img
                    [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                    [alt]="movie.title"
                    class="w-full h-60 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <!-- Hover Overlay -->
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <mat-icon class="text-white text-4xl">play_circle</mat-icon>
                  </div>
                  <!-- Rating Badge -->
                  <div class="absolute top-2 right-2 bg-black/80 text-[#f5c518] text-xs font-bold px-2 py-1 rounded">
                    ⭐ {{ movie.vote_average | number:'1.1-1' }}
                  </div>
                </div>
                <p class="text-white text-sm font-medium mt-2 truncate">{{ movie.title }}</p>
                <p class="text-gray-500 text-xs">{{ movie.release_date | date:'yyyy' }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Now Playing -->
        <section>
          <h2 class="text-white text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="text-[#e50914]">|</span> Now Playing
          </h2>
          <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            @for (movie of nowPlayingMovies(); track movie.id) {
              <div
                (click)="goToDetail(movie.id)"
                class="flex-shrink-0 w-40 md:w-48 cursor-pointer group">
                <div class="relative overflow-hidden rounded-lg">
                  <img
                    [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                    [alt]="movie.title"
                    class="w-full h-60 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <mat-icon class="text-white text-4xl">play_circle</mat-icon>
                  </div>
                  <div class="absolute top-2 right-2 bg-black/80 text-[#f5c518] text-xs font-bold px-2 py-1 rounded">
                    ⭐ {{ movie.vote_average | number:'1.1-1' }}
                  </div>
                </div>
                <p class="text-white text-sm font-medium mt-2 truncate">{{ movie.title }}</p>
                <p class="text-gray-500 text-xs">{{ movie.release_date | date:'yyyy' }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Top Rated -->
        <section>
          <h2 class="text-white text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="text-[#f5c518]">|</span> Top Rated All Time
          </h2>
          <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            @for (movie of topRatedMovies(); track movie.id) {
              <div
                (click)="goToDetail(movie.id)"
                class="flex-shrink-0 w-40 md:w-48 cursor-pointer group">
                <div class="relative overflow-hidden rounded-lg">
                  <img
                    [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                    [alt]="movie.title"
                    class="w-full h-60 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <mat-icon class="text-white text-4xl">play_circle</mat-icon>
                  </div>
                  <div class="absolute top-2 right-2 bg-black/80 text-[#f5c518] text-xs font-bold px-2 py-1 rounded">
                    ⭐ {{ movie.vote_average | number:'1.1-1' }}
                  </div>
                </div>
                <p class="text-white text-sm font-medium mt-2 truncate">{{ movie.title }}</p>
                <p class="text-gray-500 text-xs">{{ movie.release_date | date:'yyyy' }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Mood Picker -->
        <section class="bg-[#141414] rounded-2xl p-8 border border-[#2a2a2a]">
          <h2 class="text-white text-xl md:text-2xl font-bold mb-2">
            🎭 What's your mood tonight?
          </h2>
          <p class="text-gray-400 text-sm mb-6">Pick a vibe and we'll find the perfect movie</p>
          <div class="flex flex-wrap gap-3">
            @for (mood of moods; track mood.label) {
              <button
                (click)="selectMood(mood.value)"
                [class]="selectedMood() === mood.value
                  ? 'px-6 py-3 rounded-full bg-[#e50914] text-white font-medium transition-all text-sm'
                  : 'px-6 py-3 rounded-full bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] font-medium transition-all text-sm'">
                {{ mood.emoji }} {{ mood.label }}
              </button>
            }
          </div>

          <!-- Mood Results -->
          @if (moodMovies().length > 0) {
            <div class="mt-8">
              <h3 class="text-white font-semibold mb-4">Perfect for your mood:</h3>
              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                @for (movie of moodMovies().slice(0, 10); track movie.id) {
                  <div
                    (click)="goToDetail(movie.id)"
                    class="flex-shrink-0 w-36 cursor-pointer group">
                    <div class="relative overflow-hidden rounded-lg">
                      <img
                        [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                        [alt]="movie.title"
                        class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <mat-icon class="text-white text-4xl">play_circle</mat-icon>
                      </div>
                    </div>
                    <p class="text-white text-xs font-medium mt-2 truncate">{{ movie.title }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </section>

      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class HomeComponent implements OnInit {
  trendingMovies = signal<Movie[]>([]);
  nowPlayingMovies = signal<Movie[]>([]);
  topRatedMovies = signal<Movie[]>([]);
  moodMovies = signal<Movie[]>([]);
  heroMovie = signal<Movie | null>(null);
  heroIndex = signal<number>(0);
  isLoading = signal<boolean>(true);
  selectedMood = signal<string>('');

  moods = [
    { label: 'Happy', value: 'happy', emoji: '😄' },
    { label: 'Excited', value: 'excited', emoji: '🤩' },
    { label: 'Romantic', value: 'romantic', emoji: '❤️' },
    { label: 'Scared', value: 'scared', emoji: '😱' },
    { label: 'Thoughtful', value: 'thoughtful', emoji: '🤔' },
    { label: 'Adventurous', value: 'adventurous', emoji: '🗺️' },
  ];

  constructor(
    public movieService: MovieService,
    public wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.movieService.getTrending().subscribe(res => {
      this.trendingMovies.set(res.results);
      this.heroMovie.set(res.results[0]);
      this.isLoading.set(false);
    });

    this.movieService.getNowPlaying().subscribe(res => {
      this.nowPlayingMovies.set(res.results);
    });

    this.movieService.getTopRated().subscribe(res => {
      this.topRatedMovies.set(res.results);
    });
  }

  setHero(index: number) {
    this.heroIndex.set(index);
    this.heroMovie.set(this.trendingMovies()[index]);
  }

  goToDetail(id: number) {
    this.router.navigate(['/movie', id]);
  }

  toggleWishlist(movie: Movie) {
    if (this.wishlistService.isInWishlist(movie.id)) {
      this.wishlistService.removeFromWishlist(movie.id);
    } else {
      this.wishlistService.addToWishlist(movie);
    }
  }

  selectMood(mood: string) {
    this.selectedMood.set(mood);
    this.movieService.getMoodMovies(mood).subscribe(res => {
      this.moodMovies.set(res.results);
    });
  }
}