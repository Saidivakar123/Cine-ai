import {
  Component, OnInit, OnDestroy, AfterViewInit,
  computed, inject, signal,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { MovieService } from '../../core/services/movie.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] px-4 md:px-8 lg:px-16 py-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-white text-3xl md:text-4xl font-bold mb-2">
          My <span class="text-[#e50914]">Dashboard</span>
        </h1>
        <p class="text-gray-400 text-sm">Your personal cinema stats at a glance</p>
      </div>

      <!-- ── Empty State ──────────────────────────────────────────────── -->
      @if (totalMovies() === 0) {
        <div class="flex flex-col items-center justify-center py-32 text-center">
          <div class="text-7xl mb-6">🎬</div>
          <h2 class="text-white text-2xl font-bold mb-2">Nothing here yet</h2>
          <p class="text-gray-400 text-sm mb-6">Add movies to your watchlist to see your stats and charts.</p>
          <button
            (click)="goToExplore()"
            class="px-6 py-3 bg-[#e50914] text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all">
            Explore Movies
          </button>
        </div>
      }

      @if (totalMovies() > 0) {

        <!-- ── Stats Row ──────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#e50914]/40 transition-colors">
            <p class="text-gray-500 text-xs mb-1">Total Movies</p>
            <p class="text-white text-3xl font-bold">{{ totalMovies() }}</p>
          </div>

          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#e50914]/40 transition-colors">
            <p class="text-gray-500 text-xs mb-1">Watched</p>
            <p class="text-green-400 text-3xl font-bold">{{ watchedCount() }}</p>
          </div>

          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#e50914]/40 transition-colors">
            <p class="text-gray-500 text-xs mb-1">Want to Watch</p>
            <p class="text-blue-400 text-3xl font-bold">{{ pendingCount() }}</p>
          </div>

          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#e50914]/40 transition-colors">
            <p class="text-gray-500 text-xs mb-1">Avg Rating</p>
            <p class="text-[#f5c518] text-3xl font-bold">{{ averageRating() }}</p>
          </div>

        </div>

        <!-- ── Progress + Favorite Genre ─────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <!-- Completion Progress -->
          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-white font-semibold">Completion</h3>
              <span class="text-[#f5c518] font-bold text-2xl">{{ completionPct() }}%</span>
            </div>
            <div class="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                style="background: linear-gradient(90deg, #e50914, #f5c518)"
                [style.width.%]="completionPct()">
              </div>
            </div>
            <p class="text-gray-600 text-xs mt-3">
              {{ watchedCount() }} of {{ totalMovies() }} movies watched
            </p>
          </div>

          <!-- Favorite Genre -->
          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 flex flex-col justify-center">
            <p class="text-gray-500 text-xs mb-2">Favorite Genre</p>
            <p class="text-[#e50914] font-bold text-3xl mb-1">{{ favoriteGenre() }}</p>
            <p class="text-gray-600 text-xs">Most common genre in your collection</p>
          </div>

        </div>

        <!-- ── Charts Row ─────────────────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">

          <!-- Genre Breakdown Bar Chart -->
          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
            <h3 class="text-white font-semibold mb-1">Genre Breakdown</h3>
            <p class="text-gray-600 text-xs mb-5">Movies per genre in your collection</p>
            @if (genreBreakdown().length === 0) {
              <div class="h-48 flex items-center justify-center text-gray-600 text-sm">
                No genre data available
              </div>
            } @else {
              <div class="relative h-64">
                <canvas #genreChart></canvas>
              </div>
            }
          </div>

          <!-- Rating Distribution Doughnut -->
          <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
            <h3 class="text-white font-semibold mb-1">Rating Distribution</h3>
            <p class="text-gray-600 text-xs mb-5">How your movies are rated on TMDB</p>
            @if (totalMovies() === 0) {
              <div class="h-48 flex items-center justify-center text-gray-600 text-sm">
                No rating data available
              </div>
            } @else {
              <div class="relative h-64">
                <canvas #ratingChart></canvas>
              </div>
            }
          </div>

        </div>

        <!-- ── Top Rated in Your Collection ──────────────────────────── -->
        @if (topRatedWatchlist().length > 0) {
          <div class="mb-10">
            <h2 class="text-white text-xl font-bold mb-4">⭐ Top Rated in Your Collection</h2>
            <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
              @for (movie of topRatedWatchlist(); track movie.id; let i = $index) {
                <div
                  (click)="goToDetail(movie.id)"
                  class="flex items-center gap-4 px-5 py-4 border-b border-[#1f1f1f] last:border-b-0
                         hover:bg-[#1a1a1a] cursor-pointer transition-colors group">

                  <!-- Rank -->
                  <span
                    class="text-xs font-bold w-7 text-center flex-shrink-0"
                    [class.text-yellow-400]="i === 0"
                    [class.text-gray-600]="i !== 0">
                    #{{ i + 1 }}
                  </span>

                  <!-- Poster -->
                  <img
                    [src]="movieService.getImageUrl(movie.poster_path, 'w200')"
                    [alt]="movie.title"
                    class="w-10 h-14 object-cover rounded-md flex-shrink-0"
                    onerror="this.src='https://placehold.co/40x56/141414/333?text=N/A'"
                  />

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-sm font-medium truncate group-hover:text-[#e50914] transition-colors">
                      {{ movie.title }}
                    </p>
                    <p class="text-gray-600 text-xs mt-0.5">{{ movie.release_date.slice(0, 4) }}</p>
                  </div>

                  <!-- Rating -->
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <span class="text-[#f5c518] text-sm">★</span>
                    <span class="text-white text-sm font-bold">{{ movie.vote_average | number:'1.1-1' }}</span>
                  </div>

                </div>
              }
            </div>
          </div>
        }

        <!-- ── Recently Watched ───────────────────────────────────────── -->
        @if (recentlyWatched().length > 0) {
          <div>
            <h2 class="text-white text-xl font-bold mb-4">🕐 Recently Watched</h2>
            <div class="recently-watched-scroll flex gap-4 overflow-x-auto pb-3">
              @for (movie of recentlyWatched(); track movie.id) {
                <div
                  (click)="goToDetail(movie.id)"
                  class="flex-shrink-0 w-36 md:w-44 cursor-pointer group">

                  <div class="relative overflow-hidden rounded-xl mb-2">
                    <img
                      [src]="movieService.getImageUrl(movie.poster_path, 'w300')"
                      [alt]="movie.title"
                      class="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      onerror="this.src='https://placehold.co/176x264/141414/333?text=N/A'"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span class="text-[#f5c518] text-xs font-bold">★ {{ movie.vote_average | number:'1.1-1' }}</span>
                    </div>
                  </div>

                  <p class="text-white text-xs font-medium truncate group-hover:text-[#e50914] transition-colors">
                    {{ movie.title }}
                  </p>
                  <p class="text-gray-600 text-xs mt-0.5">{{ movie.release_date.slice(0, 4) }}</p>
                </div>
              }
            </div>
          </div>
        }

      } <!-- end @if totalMovies > 0 -->

    </div>
  `,
  styles: [`
    .recently-watched-scroll {
      scrollbar-width: thin;
      scrollbar-color: #2a2a2a transparent;
    }
    .recently-watched-scroll::-webkit-scrollbar       { height: 4px; }
    .recently-watched-scroll::-webkit-scrollbar-track { background: transparent; }
    .recently-watched-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 99px; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  public  movieService    = inject(MovieService);
  private wishlistService = inject(WishlistService);
  private router          = inject(Router);

  @ViewChild('genreChart')  genreChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('ratingChart') ratingChartRef!: ElementRef<HTMLCanvasElement>;

  private genreChartInstance:  Chart | null = null;
  private ratingChartInstance: Chart | null = null;

  genreMap: Record<number, string> = {};
  chartsReady = signal(false);

  // ── Computed ────────────────────────────────────────────────────────────
  wishlist = computed(() => this.wishlistService.getWishlist()());
  watched  = computed(() => this.wishlistService.getWatched()());

  totalMovies   = computed(() => this.wishlist().length + this.watched().length);
  watchedCount  = computed(() => this.watched().length);
  pendingCount  = computed(() => this.wishlist().length);

  completionPct = computed(() => {
    const total = this.totalMovies();
    return total === 0 ? 0 : Math.round((this.watchedCount() / total) * 100);
  });

  averageRating = computed(() => {
    const all   = [...this.wishlist(), ...this.watched()];
    const rated = all.filter(m => m.vote_average > 0);
    if (!rated.length) return '0.0';
    const sum = rated.reduce((acc, m) => acc + m.vote_average, 0);
    return (sum / rated.length).toFixed(1);
  });

  genreBreakdown = computed(() => {
    const all = [...this.wishlist(), ...this.watched()];
    const map = new Map<string, number>();
    all.forEach(m => {
      (m.genre_ids ?? []).forEach((id: number) => {
        const name = this.genreMap[id] ?? `Genre ${id}`;
        map.set(name, (map.get(name) ?? 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });

  favoriteGenre = computed(() => {
    const b = this.genreBreakdown();
    return b.length ? b[0].name : 'N/A';
  });

  ratingDistribution = computed(() => {
    const all = [...this.wishlist(), ...this.watched()];
    const buckets: Record<string, number> = { '9-10': 0, '7-8': 0, '5-6': 0, '3-4': 0, '1-2': 0 };
    all.forEach(m => {
      const r = m.vote_average;
      if      (r >= 9) buckets['9-10']++;
      else if (r >= 7) buckets['7-8']++;
      else if (r >= 5) buckets['5-6']++;
      else if (r >= 3) buckets['3-4']++;
      else if (r >  0) buckets['1-2']++;
    });
    return buckets;
  });

  topRatedWatchlist = computed(() =>
    [...this.wishlist(), ...this.watched()]
      .filter(m => m.vote_average > 0)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 5)
  );

  recentlyWatched = computed(() => [...this.watched()].slice(-6).reverse());

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit() {
    this.movieService.getGenres().subscribe(res => {
      res.genres.forEach((g: { id: number; name: string }) => (this.genreMap[g.id] = g.name));
      this.chartsReady.set(true);
    });
  }

  ngAfterViewInit() {
    const poll = setInterval(() => {
      if (this.chartsReady()) {
        clearInterval(poll);
        setTimeout(() => this.renderCharts(), 50);
      }
    }, 100);
  }

  private renderCharts() {
    this.renderGenreChart();
    this.renderRatingChart();
  }

  private renderGenreChart() {
    if (!this.genreChartRef) return;
    const data = this.genreBreakdown();
    if (!data.length) return;

    this.genreChartInstance?.destroy();
    const ctx = this.genreChartRef.nativeElement.getContext('2d')!;

    this.genreChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: 'Movies',
          data: data.map(d => d.count),
          backgroundColor: data.map((_, i) =>
            i === 0 ? '#e50914' :
            i === 1 ? '#f5c518' :
            `rgba(229,9,20,${Math.max(0.3, 0.75 - i * 0.07)})`
          ),
          borderColor: 'transparent',
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#fff',
            bodyColor: '#9ca3af',
            borderColor: '#2a2a2a',
            borderWidth: 1,
          }
        },
        scales: {
          x: { grid: { color: '#1f1f1f' }, ticks: { color: '#6b7280', font: { size: 11 } } },
          y: { grid: { color: '#1f1f1f' }, ticks: { color: '#6b7280', stepSize: 1 }, beginAtZero: true }
        }
      }
    });
  }

  private renderRatingChart() {
    if (!this.ratingChartRef) return;
    const dist   = this.ratingDistribution();
    const labels = Object.keys(dist);
    const counts = Object.values(dist);
    if (counts.every(v => v === 0)) return;

    this.ratingChartInstance?.destroy();
    const ctx = this.ratingChartRef.nativeElement.getContext('2d')!;

    this.ratingChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#e50914', '#f5c518', '#22c55e', '#3b82f6', '#a855f7'],
          borderColor: '#141414',
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#9ca3af', padding: 14, font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#fff',
            bodyColor: '#9ca3af',
            borderColor: '#2a2a2a',
            borderWidth: 1,
          }
        }
      }
    });
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  goToDetail(id: number) { this.router.navigate(['/movie', id]); }
  goToExplore()          { this.router.navigate(['/explore']); }

  ngOnDestroy() {
    this.genreChartInstance?.destroy();
    this.ratingChartInstance?.destroy();
  }
}