import { Injectable, signal, computed, effect } from '@angular/core';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private wishlist = signal<Movie[]>(this.loadFromStorage());
  private watched = signal<Movie[]>(this.loadWatchedFromStorage());

  // Computed
  wishlistCount = computed(() => this.wishlist().length);
  watchedCount = computed(() => this.watched().length);

  constructor() {
    // Auto-save to localStorage whenever wishlist changes
    effect(() => {
      localStorage.setItem('cineai_wishlist', JSON.stringify(this.wishlist()));
    });
    effect(() => {
      localStorage.setItem('cineai_watched', JSON.stringify(this.watched()));
    });
  }

  // ─── Wishlist ─────────────────────────────────────────
  getWishlist() {
    return this.wishlist;
  }

  addToWishlist(movie: Movie) {
    if (!this.isInWishlist(movie.id)) {
      this.wishlist.update(list => [...list, movie]);
    }
  }

  removeFromWishlist(movieId: number) {
    this.wishlist.update(list => list.filter(m => m.id !== movieId));
  }

  isInWishlist(movieId: number): boolean {
    return this.wishlist().some(m => m.id === movieId);
  }

  // ─── Watched ──────────────────────────────────────────
  getWatched() {
    return this.watched;
  }

  markAsWatched(movie: Movie) {
    if (!this.isWatched(movie.id)) {
      this.watched.update(list => [...list, movie]);
      this.removeFromWishlist(movie.id);
    }
  }

  isWatched(movieId: number): boolean {
    return this.watched().some(m => m.id === movieId);
  }

  // ─── Storage ──────────────────────────────────────────
  private loadFromStorage(): Movie[] {
    const data = localStorage.getItem('cineai_wishlist');
    return data ? JSON.parse(data) : [];
  }

  private loadWatchedFromStorage(): Movie[] {
    const data = localStorage.getItem('cineai_watched');
    return data ? JSON.parse(data) : [];
  }

  // ─── Stats for Dashboard ──────────────────────────────
  getStats() {
    return computed(() => ({
      totalWishlist: this.wishlist().length,
      totalWatched: this.watched().length,
    }));
  }
}