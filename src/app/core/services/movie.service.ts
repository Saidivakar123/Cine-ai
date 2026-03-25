import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDetail, ApiResponse, Genre, Cast } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  // Signals for state management
  searchQuery = signal<string>('');
  selectedGenre = signal<number | null>(null);
  isLoading = signal<boolean>(false);

  // Computed signal
  hasActiveFilter = computed(() =>
    this.searchQuery() !== '' || this.selectedGenre() !== null
  );

  private headers = new HttpHeaders({
    'Authorization': `Bearer ${environment.tmdbToken}`,
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  // ─── Trending ───────────────────────────────────────────
  getTrending(): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/trending/movie/week`,
      { headers: this.headers }
    );
  }

  // ─── Now Playing ────────────────────────────────────────
  getNowPlaying(): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/movie/now_playing`,
      { headers: this.headers }
    );
  }

  // ─── Top Rated ──────────────────────────────────────────
  getTopRated(): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/movie/top_rated`,
      { headers: this.headers }
    );
  }

  // ─── Popular ────────────────────────────────────────────
  getPopular(page: number = 1): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/movie/popular?page=${page}`,
      { headers: this.headers }
    );
  }

  // ─── Search ─────────────────────────────────────────────
  searchMovies(query: string, page: number = 1): Observable<ApiResponse<Movie>> {
    if (!query.trim()) return of({ page: 1, results: [], total_pages: 0, total_results: 0 });
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
      { headers: this.headers }
    );
  }

  // ─── Movie Detail ────────────────────────────────────────
  getMovieDetail(id: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(
      `${environment.tmdbBaseUrl}/movie/${id}`,
      { headers: this.headers }
    );
  }

  // ─── Movie Credits ───────────────────────────────────────
  getMovieCredits(id: number): Observable<{ cast: Cast[] }> {
    return this.http.get<{ cast: Cast[] }>(
      `${environment.tmdbBaseUrl}/movie/${id}/credits`,
      { headers: this.headers }
    );
  }

  // ─── Similar Movies ──────────────────────────────────────
  getSimilarMovies(id: number): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/movie/${id}/similar`,
      { headers: this.headers }
    );
  }

  // ─── Genres ──────────────────────────────────────────────
  getGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(
      `${environment.tmdbBaseUrl}/genre/movie/list`,
      { headers: this.headers }
    );
  }

  // ─── By Genre ────────────────────────────────────────────
  getMoviesByGenre(genreId: number, page: number = 1): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(
      `${environment.tmdbBaseUrl}/discover/movie?with_genres=${genreId}&page=${page}`,
      { headers: this.headers }
    );
  }

  // ─── Image URL Helper ────────────────────────────────────
  getImageUrl(path: string, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return 'assets/no-image.png';
    return `${environment.tmdbImageUrl}/${size}${path}`;
  }

  // ─── Mood Based ──────────────────────────────────────────
  getMoodMovies(mood: string): Observable<ApiResponse<Movie>> {
    const moodGenreMap: Record<string, number> = {
      'happy': 35,       // Comedy
      'excited': 28,     // Action
      'romantic': 10749, // Romance
      'scared': 27,      // Horror
      'thoughtful': 18,  // Drama
      'adventurous': 12  // Adventure
    };
    const genreId = moodGenreMap[mood] || 28;
    return this.getMoviesByGenre(genreId);
  }
}