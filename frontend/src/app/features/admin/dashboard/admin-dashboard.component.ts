// src/app/features/admin/dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CohortService } from '../../../core/services/cohort.service';
import { DashboardStats, CohortRequest } from '../../../shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private cohortService: CohortService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    this.loading = true;
    this.cohortService.getAdminDashboard().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Failed to load dashboard', 'Close', { duration: 3000 }); }
    });
  }

  viewRequest(id: number): void { this.router.navigate(['/admin/approvals', id]); }
  goToApprovals(): void { this.router.navigate(['/admin/approvals']); }
  goToSmes(): void { this.router.navigate(['/admin/smes']); }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      PING_SENT: 'send', REQUEST_APPROVED: 'check_circle', REQUEST_REJECTED: 'cancel',
      SME_ADDED: 'person_add', SME_REMOVED: 'person_remove', SME_ACCEPTED: 'thumb_up',
      SME_DECLINED: 'thumb_down', REQUEST_SUBMITTED: 'assignment'
    };
    return icons[type] ?? 'info';
  }

  getActivityColor(type: string): string {
    const colors: Record<string, string> = {
      PING_SENT: '#12987A', REQUEST_APPROVED: '#1A8240', REQUEST_REJECTED: '#C22626',
      SME_ADDED: '#2A70B2', SME_ACCEPTED: '#1A8240', SME_DECLINED: '#BE780E',
      REQUEST_SUBMITTED: '#6838A8'
    };
    return colors[type] ?? '#5C728C';
  }
}
