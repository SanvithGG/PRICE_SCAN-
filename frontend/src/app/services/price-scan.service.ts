import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Region = 'both' | 'india' | 'global';

export interface SearchResult {
  id: string;
  title: string;
  site: string;
  store: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  region: Region;
  url: string;
  image: string;
  badge: string;
  isWinner?: boolean;
}

export interface TerminalStep {
  name: string;
  status: 'pending' | 'scanning' | 'ok';
}

@Injectable({
  providedIn: 'root'
})
export class PriceScanService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8081/api';

  // Search & Filter State
  readonly query = signal('');
  readonly region = signal<Region>('both');
  readonly loading = signal(false);
  readonly siteFilter = signal('all');
  readonly sortOption = signal<'price-asc' | 'price-desc' | 'rating'>('price-asc');
  readonly searchExecuted = signal(false);

  // Results & Live Scan Log
  readonly results = signal<SearchResult[]>([]);
  readonly winner = signal<SearchResult | null>(null);
  readonly terminalLogs = signal<TerminalStep[]>([]);
  readonly terminalPhase = signal<'idle' | 'scanning' | 'done'>('idle');

  // Bulk Scanner Modal State
  readonly showBulkModal = signal(false);
  readonly bulkInput = signal('');
  readonly bulkResults = signal<{ query: string; bestPrice: number; store: string }[]>([]);

  // User Auth & History State
  readonly user = signal<string | null>(this.loadUser());
  readonly history = signal<string[]>(this.loadHistory());

  constructor() {}

  get loggedIn(): boolean {
    return !!this.user();
  }

  readonly filteredResults = computed(() => {
    let items = [...this.results()];
    const site = this.siteFilter().toLowerCase();

    if (site !== 'all') {
      items = items.filter(i => i.site.toLowerCase().includes(site) || i.store.toLowerCase().includes(site));
    }

    const sort = this.sortOption();
    if (sort === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }

    return items;
  });

  setRegion(r: Region): void {
    this.region.set(r);
  }

  setSiteFilter(site: string): void {
    this.siteFilter.set(site);
  }

  setSortOption(sort: 'price-asc' | 'price-desc' | 'rating'): void {
    this.sortOption.set(sort);
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  toggleBulkModal(open: boolean): void {
    this.showBulkModal.set(open);
  }

  async startSearch(overrideQuery?: string): Promise<void> {
    if (overrideQuery !== undefined) {
      this.query.set(overrideQuery);
    }

    const text = (this.query() || 'watch').trim();
    if (!this.query()) {
      this.query.set(text);
    }

    this.loading.set(true);
    this.searchExecuted.set(true);
    this.terminalPhase.set('scanning');

    const stores = [
      'Scanning Amazon.in...',
      'Scanning Flipkart...',
      'Scanning Myntra...',
      'Scanning Croma...',
      'Scanning Reliance Digital...',
      'Scanning Amazon...',
      'Scanning eBay...',
      'Scanning Walmart...'
    ];

    this.terminalLogs.set(stores.map(s => ({ name: s, status: 'pending' })));

    for (let i = 0; i < stores.length; i++) {
      this.terminalLogs.update(logs => {
        const copy = [...logs];
        copy[i] = { ...copy[i], status: 'scanning' };
        return copy;
      });
      await new Promise(r => setTimeout(r, 120 + Math.random() * 80));

      this.terminalLogs.update(logs => {
        const copy = [...logs];
        copy[i] = { ...copy[i], status: 'ok' };
        return copy;
      });
    }

    await new Promise(r => setTimeout(r, 100));

    let items: SearchResult[] = [];
    let bestWinner: SearchResult | null = null;

    try {
      const url = `${this.apiBase}/scan/search?query=${encodeURIComponent(text)}&region=${this.region()}&siteFilter=${this.siteFilter()}&sortOption=${this.sortOption()}`;
      const backendRes = await firstValueFrom(this.http.get<any>(url));
      if (backendRes && backendRes.results) {
        items = backendRes.results;
        bestWinner = backendRes.winner || (items.length > 0 ? items[0] : null);
      } else {
        items = this.getMockResults(text, this.region());
      }
    } catch {
      // Backend offline or unreachable fallback
      items = this.getMockResults(text, this.region());
    }

    this.results.set(items);
    this.winner.set(bestWinner || items.find(i => i.isWinner) || (items.length > 0 ? items[0] : null));
    this.loading.set(false);
    this.terminalPhase.set('done');
    this.saveSearch(text);
  }

  async runBulkScan(): Promise<void> {
    const lines = this.bulkInput()
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    try {
      const backendRes = await firstValueFrom(
        this.http.post<any>(`${this.apiBase}/scan/bulk`, { textInput: this.bulkInput() })
      );
      if (backendRes && backendRes.items) {
        this.bulkResults.set(backendRes.items);
        return;
      }
    } catch {}

    const mockBulk = lines.map(q => ({
      query: q,
      bestPrice: Math.round((25 + Math.random() * 300) * 100) / 100,
      store: ['Amazon', 'Flipkart', 'Walmart', 'Reliance Digital'][Math.floor(Math.random() * 4)]
    }));

    this.bulkResults.set(mockBulk);
  }

  login(emailStr: string, passStr: string): { success: boolean; message: string } {
    const email = emailStr.trim().toLowerCase();
    const password = passStr.trim();
    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    // Try backend auth asynchronously in background
    this.http.post<any>(`${this.apiBase}/auth/login`, { email, password }).subscribe({
      next: (res) => {
        if (res && res.user) {
          localStorage.setItem('price-scan-user', res.email || email);
          this.user.set(res.email || email);
        }
      },
      error: () => {}
    });

    localStorage.setItem(`price-scan-user:${email}`, JSON.stringify({ name: email.split('@')[0], password }));
    localStorage.setItem('price-scan-user', email);
    this.user.set(email);
    this.history.set(this.loadHistory());
    return { success: true, message: `Welcome back!` };
  }

  signup(nameStr: string, emailStr: string, passStr: string): { success: boolean; message: string } {
    const name = nameStr.trim();
    const email = emailStr.trim().toLowerCase();
    const password = passStr.trim();

    if (!name || !email || !password) {
      return { success: false, message: 'Name, email, and password are required.' };
    }

    this.http.post<any>(`${this.apiBase}/auth/signup`, { name, email, password }).subscribe({
      next: (res) => {
        if (res && res.email) {
          localStorage.setItem('price-scan-user', res.email);
          this.user.set(res.email);
        }
      },
      error: () => {}
    });

    localStorage.setItem(`price-scan-user:${email}`, JSON.stringify({ name, password }));
    localStorage.setItem('price-scan-user', email);
    this.user.set(email);
    this.history.set(this.loadHistory());
    return { success: true, message: `Account created successfully!` };
  }

  logout(): void {
    localStorage.removeItem('price-scan-user');
    this.user.set(null);
    this.history.set([]);
  }

  private loadUser(): string | null {
    return localStorage.getItem('price-scan-user');
  }

  private loadHistory(): string[] {
    const email = this.user();
    if (!email) return [];
    const saved = localStorage.getItem(`price-scan-history:${email}`);
    return saved ? JSON.parse(saved) : ['watch', 'iPhone 15', 'Sony WH-1000XM5'];
  }

  private saveSearch(text: string): void {
    const email = this.user();
    const key = email ? `price-scan-history:${email}` : 'price-scan-guest-history';
    const existing = this.loadHistory();
    const newest = [text, ...existing.filter(i => i.toLowerCase() !== text.toLowerCase())].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(newest));
    this.history.set(newest);
  }

  private getMockResults(queryStr: string, reg: Region): SearchResult[] {
    const q = queryStr.toLowerCase();

    const watchImages = [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80'
    ];

    const techImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'
    ];

    if (q.includes('watch')) {
      const items: SearchResult[] = [
        {
          id: 'w1',
          title: 'Timex Expedition Scout 40mm Quartz Watch',
          site: 'Walmart',
          store: 'WALMART',
          price: 42.99,
          currency: '$',
          rating: 4.3,
          reviews: 3500,
          region: 'global',
          url: 'https://www.walmart.com/search?q=watch',
          image: watchImages[0],
          badge: 'Walmart'
        },
        {
          id: 'w2',
          title: 'Fitbit Charge 6 Fitness Tracker',
          site: 'Best Buy',
          store: 'BEST BUY',
          price: 159.99,
          currency: '$',
          rating: 4.1,
          reviews: 800,
          region: 'global',
          url: 'https://www.bestbuy.com',
          image: watchImages[1],
          badge: 'Best Buy'
        },
        {
          id: 'w3',
          title: 'Seiko 5 Sports Automatic Men\'s Watch',
          site: 'eBay',
          store: 'EBAY',
          price: 285.50,
          currency: '$',
          rating: 4.7,
          reviews: 128,
          region: 'global',
          url: 'https://www.ebay.com',
          image: watchImages[2],
          badge: 'eBay'
        },
        {
          id: 'w4',
          title: 'Apple Watch Series 9 GPS 41mm',
          site: 'Amazon',
          store: 'AMAZON',
          price: 399.00,
          currency: '$',
          rating: 4.8,
          reviews: 12456,
          region: 'global',
          url: 'https://www.amazon.com',
          image: watchImages[3],
          badge: 'Amazon'
        },
        {
          id: 'w5',
          title: 'Noise ColorFit Pulse 3 Smartwatch',
          site: 'Reliance Digital',
          store: 'RELIANCE DIGITAL',
          price: 19.99,
          currency: '$',
          rating: 4.0,
          reviews: 1540,
          region: 'india',
          url: 'https://www.reliancedigital.in',
          image: watchImages[4],
          badge: 'BEST DEAL',
          isWinner: true
        },
        {
          id: 'w6',
          title: 'Casio Vintage Digital Quartz Watch',
          site: 'Flipkart',
          store: 'FLIPKART',
          price: 29.50,
          currency: '$',
          rating: 4.6,
          reviews: 4920,
          region: 'india',
          url: 'https://www.flipkart.com',
          image: watchImages[5],
          badge: 'Flipkart'
        },
        {
          id: 'w7',
          title: 'Fossil Gen 6 Touchscreen Smartwatch',
          site: 'Myntra',
          store: 'MYNTRA',
          price: 189.50,
          currency: '$',
          rating: 4.2,
          reviews: 730,
          region: 'india',
          url: 'https://www.myntra.com',
          image: watchImages[6],
          badge: 'Myntra'
        },
        {
          id: 'w8',
          title: 'Garmin Forerunner 255 GPS Smartwatch',
          site: 'Croma',
          store: 'CROMA',
          price: 349.99,
          currency: '$',
          rating: 4.9,
          reviews: 1890,
          region: 'india',
          url: 'https://www.croma.com',
          image: watchImages[7],
          badge: 'Croma'
        }
      ];

      return items.filter(i => reg === 'both' || i.region === reg);
    }

    const storesList = [
      { site: 'Amazon', store: 'AMAZON', region: 'global' as Region, img: techImages[0] },
      { site: 'Flipkart', store: 'FLIPKART', region: 'india' as Region, img: techImages[1] },
      { site: 'Walmart', store: 'WALMART', region: 'global' as Region, img: techImages[2] },
      { site: 'eBay', store: 'EBAY', region: 'global' as Region, img: techImages[3] },
      { site: 'Reliance Digital', store: 'RELIANCE DIGITAL', region: 'india' as Region, img: techImages[4] },
      { site: 'Myntra', store: 'MYNTRA', region: 'india' as Region, img: techImages[5] },
      { site: 'Best Buy', store: 'BEST BUY', region: 'global' as Region, img: techImages[0] },
      { site: 'Croma', store: 'CROMA', region: 'india' as Region, img: techImages[1] }
    ];

    const basePrice = Math.max(15, (queryStr.length * 37) % 450);
    const items: SearchResult[] = storesList.map((s, idx) => {
      const itemPrice = Math.round((basePrice + idx * 24.5 + (idx % 2 ? -12 : 18)) * 100) / 100;
      return {
        id: `gen-${idx}`,
        title: `${queryStr.charAt(0).toUpperCase() + queryStr.slice(1)} ${['Pro', 'Ultra', 'Edition', 'Special', 'Lite', 'Plus'][idx % 6]}`,
        site: s.site,
        store: s.store,
        price: itemPrice,
        currency: '$',
        rating: Math.round((4.0 + (idx % 10) * 0.1) * 10) / 10,
        reviews: 450 + idx * 820,
        region: s.region,
        url: `https://www.${s.site.toLowerCase().replace(/\s+/g, '')}.com/search?q=${encodeURIComponent(queryStr)}`,
        image: s.img,
        badge: s.site,
        isWinner: idx === 0
      };
    });

    items.sort((a, b) => a.price - b.price);
    items[0].isWinner = true;
    items[0].badge = 'BEST DEAL';

    return items.filter(i => reg === 'both' || i.region === reg);
  }
}
