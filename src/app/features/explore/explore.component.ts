import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MovieService } from '../../core/services/movie.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Movie, Genre } from '../../core/models/movie.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] px-4 md:px-8 lg:px-16 py-8">

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-white text-3xl md:text-4xl font-bold mb-2">
          Explore <span class="text-[#e50914]">Movies</span>
        </h1>
        <p class="text-gray-400 text-sm">Search thousands of movies or browse by genre</p>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-6">
        <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</mat-icon>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch($event)"
          placeholder="Search for a movie..."
          class="w-full bg-[#141414] border border-[#2a2a2a] text-white placeholder-gray-500
                 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#e50914]
                 transition-colors duration-200"
        />
        @if (searchQuery) {
          <button
            (click)="clearSearch()"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      <!-- Genre Filter Pills -->
      <div class="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <button
          (click)="selectGenre(null)"
          [class]="selectedGenre() === null
            ? 'flex-shrink-0 px-5 py-2 rounded-full bg-[#e50914] text-white text-sm font-medium transition-all'
            : 'flex-shrink-0 px-5 py-2 rounded-full bg-[#141414] border border-[#2a2a2a] text-gray-300 hover:border-[#e50914] text-sm font-medium transition-all'">
          All
        </button>
        @for (genre of genres(); track genre.id) {
          <button
            (click)="selectGenre(genre.id)"
            [class]="selectedGenre() === genre.id
              ? 'flex-shrink-0 px-5 py-2 rounded-full bg-[#e50914] text-white text-sm font-medium transition-all'
              : 'flex-shrink-0 px-5 py-2 rounded-full bg-[#141414] border border-[#2a2a2a] text-gray-300 hover:border-[#e50914] text-sm font-medium transition-all'">
            {{ genre.name }}
          </button>
        }
      </div>

      <!-- Results Count -->
      @if (!isLoading()) {
        <p class="text-gray-500 text-sm mb-6">
          {{ movies().length }} movies found
          @if (searchQuery) {
            <span> for "<span class="text-white">{{ searchQuery }}</span>"</span>
          }
        </p>
      }

      <!-- Loading Spinner -->
      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <mat-spinner diameter="48" color="warn"></mat-spinner>
        </div>
      }

      <!-- Movie Grid -->
      @if (!isLoading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (movie of movies(); track movie.id) {
            <div
              (click)="goToDetail(movie.id)"
              class="cursor-pointer group">
              <div class="relative overflow-hidden rounded-lg bg-[#141414]">
                <img
                  [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                  [alt]="movie.title"
                  class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100
                            transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-3">
                  <mat-icon class="text-white" style="font-size:40px;width:40px;height:40px">play_circle</mat-icon>
                  <p class="text-white text-xs text-center font-medium line-clamp-2">{{ movie.overview }}</p>
                </div>
                <!-- Rating -->
                <div class="absolute top-2 left-2 bg-black/80 text-[#f5c518] text-xs font-bold px-2 py-1 rounded">
                  ⭐ {{ movie.vote_average | number:'1.1-1' }}
                </div>
                <!-- Wishlist Button -->
                <button
                  (click)="toggleWishlist($event, movie)"
                  class="absolute top-2 right-2 bg-black/80 text-white p-1 rounded-full
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         hover:bg-[#e50914]">
                  <mat-icon style="font-size:16px;width:16px;height:16px">
                    {{ wishlistService.isInWishlist(movie.id) ? 'bookmark' : 'bookmark_border' }}
                  </mat-icon>
                </button>
              </div>
              <p class="text-white text-xs font-medium mt-2 truncate">{{ movie.title }}</p>
              <p class="text-gray-500 text-xs">{{ movie.release_date | date:'yyyy' }}</p>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && movies().length === 0) {
        <div class="flex flex-col items-center justify-center h-64 gap-4">
          <mat-icon class="text-gray-600" style="font-size:64px;width:64px;height:64px">movie_filter</mat-icon>
          <p class="text-gray-400 text-lg">No movies found</p>
          <p class="text-gray-600 text-sm">Try a different search or genre</p>
        </div>
      }

      <!-- Load More -->
      @if (!isLoading() && movies().length > 0 && !searchQuery) {
        <div class="flex justify-center mt-12">
          <button
            (click)="loadMore()"
            class="px-8 py-3 bg-[#141414] border border-[#2a2a2a] text-white rounded-xl
                   hover:border-[#e50914] hover:text-[#e50914] transition-all duration-200 text-sm font-medium">
            Load More Movies
          </button>
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
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ExploreComponent implements OnInit {
  movies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  selectedGenre = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  searchQuery = '';
  currentPage = 1;

  private searchSubject = new Subject<string>();

  constructor(
    public movieService: MovieService,
    public wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGenres();
    this.loadPopular();

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading.set(true);
        if (!query.trim()) {
          return this.movieService.getPopular();
        }
        return this.movieService.searchMovies(query);
      })
    ).subscribe(res => {
      this.movies.set(res.results);
      this.isLoading.set(false);
    });
  }

  loadGenres() {
    this.movieService.getGenres().subscribe(res => {
      this.genres.set(res.genres);
    });
  }

  loadPopular() {
    this.isLoading.set(true);
    this.movieService.getPopular(this.currentPage).subscribe(res => {
      this.movies.set(res.results);
      this.isLoading.set(false);
    });
  }

  onSearch(query: string) {
    this.selectedGenre.set(null);
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedGenre.set(null);
    this.loadPopular();
  }

  selectGenre(genreId: number | null) {
    this.selectedGenre.set(genreId);
    this.searchQuery = '';
    this.isLoading.set(true);
    if (genreId === null) {
      this.loadPopular();
    } else {
      this.movieService.getMoviesByGenre(genreId).subscribe(res => {
        this.movies.set(res.results);
        this.isLoading.set(false);
      });
    }
  }

  loadMore() {
    this.currentPage++;
    this.isLoading.set(true);
    this.movieService.getPopular(this.currentPage).subscribe(res => {
      this.movies.update(existing => [...existing, ...res.results]);
      this.isLoading.set(false);
    });
  }

  goToDetail(id: number) {
    this.router.navigate(['/movie', id]);
  }

  toggleWishlist(event: Event, movie: Movie) {
    event.stopPropagation();
    if (this.wishlistService.isInWishlist(movie.id)) {
      this.wishlistService.removeFromWishlist(movie.id);
    } else {
      this.wishlistService.addToWishlist(movie);
    }
  }
}