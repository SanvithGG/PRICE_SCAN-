import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PriceScanService } from '../services/price-scan.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
      
      <!-- Left Half: Dark Blue Visual Studio Hero -->
      <div class="relative bg-[#07131e] min-h-[400px] lg:min-h-full flex flex-col justify-end p-10 sm:p-14 overflow-hidden border-r border-[#161820]">
        <img
          src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&auto=format&fit=crop&q=80"
          alt="Studio Product Photography"
          class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#08090b] via-transparent to-transparent"></div>

        <div class="relative z-10 space-y-2 max-w-lg">
          <span class="text-xs font-mono font-bold tracking-widest text-[#88ab00] uppercase">
            FREE FOREVER
          </span>
          <h2 class="font-display text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Never overpay again.<br />Start scanning in 10s.
          </h2>
        </div>
      </div>

      <!-- Right Half: Dark Form Panel -->
      <div class="bg-[#08090b] p-10 sm:p-20 flex flex-col justify-center max-w-md mx-auto w-full space-y-8 animate-card-enter">
        
        <!-- Subtitle & Title -->
        <div class="space-y-1">
          <p class="text-xs font-mono font-bold tracking-[0.25em] text-[#6b7280] uppercase">
            {{ isSignup() ? 'CREATE ACCOUNT' : 'WELCOME BACK' }}
          </p>
          <h2 class="font-display text-5xl font-extrabold text-white tracking-tight">
            {{ isSignup() ? 'Get started.' : 'Log in.' }}
          </h2>
        </div>

        <!-- Auth Form -->
        <form (submit)="$event.preventDefault()" class="space-y-6">
          
          <div *ngIf="isSignup()" class="space-y-2 animate-card-enter" style="animation-delay: 50ms">
            <label class="block text-[10px] font-mono font-bold text-[#8b929e] uppercase tracking-[0.2em]">NAME</label>
            <input
              type="text"
              [value]="authName()"
              (input)="authName.set($any($event.target).value)"
              placeholder="Your name"
              class="w-full bg-[#040507] text-white border border-[#1a1d26] focus:border-[#d4ff00] rounded-lg px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#d4ff00] transition-all"
            />
          </div>

          <div class="space-y-2 animate-card-enter" style="animation-delay: 100ms">
            <label class="block text-[10px] font-mono font-bold text-[#8b929e] uppercase tracking-[0.2em]">EMAIL</label>
            <input
              type="email"
              [value]="authEmail()"
              (input)="authEmail.set($any($event.target).value)"
              placeholder="you@example.com"
              class="w-full bg-[#040507] text-white border border-[#1a1d26] focus:border-[#d4ff00] rounded-lg px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#d4ff00] transition-all"
            />
          </div>

          <div class="space-y-2 animate-card-enter" style="animation-delay: 150ms">
            <label class="block text-[10px] font-mono font-bold text-[#8b929e] uppercase tracking-[0.2em]">PASSWORD</label>
            <input
              type="password"
              [value]="authPassword()"
              (input)="authPassword.set($any($event.target).value)"
              placeholder="••••••••"
              class="w-full bg-[#040507] text-white border border-[#1a1d26] focus:border-[#d4ff00] rounded-lg px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#d4ff00] transition-all"
            />
          </div>

          <button
            type="button"
            (click)="submitForm()"
            class="w-full btn-shimmer text-black font-mono font-bold text-xs tracking-wider uppercase py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(212,255,0,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer mt-4"
          >
            {{ isSignup() ? 'CREATE ACCOUNT' : 'LOG IN' }}
          </button>

          <p *ngIf="message()" class="text-xs font-mono text-amber-400 pt-1 animate-card-enter">{{ message() }}</p>
        </form>

        <!-- Switch Auth Mode Router Link -->
        <div class="text-xs font-mono text-[#8b929e]">
          <ng-container *ngIf="isSignup()">
            Already registered? 
            <a routerLink="/login" class="text-[#d4ff00] font-bold hover:underline ml-1">Log in</a>
          </ng-container>
          <ng-container *ngIf="!isSignup()">
            Don't have an account? 
            <a routerLink="/signup" class="text-[#d4ff00] font-bold hover:underline ml-1">Sign up</a>
          </ng-container>
        </div>

      </div>
    </section>
  `
})
export class AuthComponent implements OnInit {
  private readonly ps = inject(PriceScanService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSignup = signal(true);
  protected readonly authName = signal('');
  protected readonly authEmail = signal('');
  protected readonly authPassword = signal('');
  protected readonly message = signal('');

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isSignup.set(data['mode'] === 'signup');
      this.message.set('');
    });
  }

  protected submitForm(): void {
    if (this.isSignup()) {
      const res = this.ps.signup(this.authName(), this.authEmail(), this.authPassword());
      this.message.set(res.message);
      if (res.success) {
        setTimeout(() => this.router.navigate(['/']), 500);
      }
    } else {
      const res = this.ps.login(this.authEmail(), this.authPassword());
      this.message.set(res.message);
      if (res.success) {
        setTimeout(() => this.router.navigate(['/']), 500);
      }
    }
  }
}
