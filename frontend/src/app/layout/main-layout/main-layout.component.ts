// src/app/layout/main-layout/main-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../shared/models';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  sidebarOpen = true;

  adminLinks = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/smes', icon: 'people', label: 'SME Database' },
    { path: '/admin/approvals', icon: 'check_circle', label: 'Approvals' },
  ];

  pocLinks = [
    { path: '/poc/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/poc/cohorts', icon: 'folder', label: 'My Cohorts' },
    { path: '/poc/cohorts/new', icon: 'add_circle', label: 'New Request' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    // Auto-redirect to correct dashboard
    if (this.router.url === '/') {
      this.router.navigate([this.auth.isAdmin() ? '/admin/dashboard' : '/poc/dashboard']);
    }
  }

  get navLinks() {
    return this.auth.isAdmin() ? this.adminLinks : this.pocLinks;
  }

  logout(): void { this.auth.logout(); }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
}
