// src/app/features/admin/approval/approval-detail/approval-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CohortService } from '../../../../core/services/cohort.service';
import { CohortRequest, SmeSummary } from '../../../../shared/models';

@Component({
  selector: 'app-approval-detail',
  templateUrl: './approval-detail.component.html',
  styleUrls: ['./approval-detail.component.scss']
})
export class ApprovalDetailComponent implements OnInit {
  request: CohortRequest | null = null;
  loading = true;
  submitting = false;
  adminNote = new FormControl('');
  selectedSmeIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cohortService: CohortService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cohortService.getRequestById(id).subscribe({
      next: (r) => {
        this.request = r;
        // Pre-select all available SMEs
        r.proposedSmes.forEach(s => {
          if (s.availabilityStatus === 'AVAILABLE' || s.availabilityStatus === 'PENDING') {
            this.selectedSmeIds.add(s.id);
          }
        });
        this.loading = false;
      },
      error: () => { this.loading = false; this.snack.open('Failed to load request', 'Close', { duration: 3000 }); }
    });
  }

  toggleSme(id: number): void {
    if (this.selectedSmeIds.has(id)) this.selectedSmeIds.delete(id);
    else this.selectedSmeIds.add(id);
  }

  isSelected(id: number): boolean { return this.selectedSmeIds.has(id); }

  isConflict(sme: SmeSummary): boolean { return sme.availabilityStatus === 'BOOKED'; }

  decide(decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'): void {
    if (!this.request) return;
    this.submitting = true;
    this.cohortService.processDecision(this.request.id, {
      decision,
      adminNote: this.adminNote.value || undefined,
      selectedSmeIds: decision === 'APPROVE' ? Array.from(this.selectedSmeIds) : undefined
    }).subscribe({
      next: () => {
        const msg = decision === 'APPROVE'
          ? '✅ Approved! Teams pings sent to selected SMEs.'
          : decision === 'REJECT' ? 'Request rejected.' : 'Changes requested sent to POC.';
        this.snack.open(msg, 'Close', { duration: 5000 });
        this.router.navigate(['/admin/approvals']);
      },
      error: (err) => {
        this.submitting = false;
        this.snack.open(err.error?.error ?? 'Action failed', 'Close', { duration: 4000 });
      }
    });
  }

  goBack(): void { this.router.navigate(['/admin/approvals']); }

  getAvailColor(s: string): string {
    const m: Record<string, string> = { AVAILABLE: '#1A8240', BOOKED: '#C22626', PENDING: '#BE780E', ON_HOLD: '#6838A8' };
    return m[s] ?? '#5C728C';
  }
}
