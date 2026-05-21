// src/app/features/admin/sme-database/sme-database.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sme, AvailabilityStatus } from '../../../shared/models';
import { SmeService } from '../../../core/services/sme.service';
import { SmeFormDialogComponent } from './sme-form-dialog/sme-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sme-database',
  templateUrl: './sme-database.component.html',
  styleUrls: ['./sme-database.component.scss']
})
export class SmeDatabaseComponent implements OnInit {
  displayedColumns = ['avatar', 'fullName', 'email', 'specialties', 'department', 'yearsOfExperience', 'availabilityStatus', 'lastBooked', 'actions'];
  dataSource = new MatTableDataSource<Sme>([]);
  loading = false;
  searchTerm = '';
  selectedStatus: AvailabilityStatus | '' = '';

  statusOptions: { value: AvailabilityStatus | '', label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private smeService: SmeService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadSmes(); }

  loadSmes(): void {
    this.loading = true;
    this.smeService.getAll(
      this.searchTerm || undefined,
      undefined,
      this.selectedStatus ? this.selectedStatus as AvailabilityStatus : undefined
    ).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.loading = false;
      },
      error: () => { this.loading = false; this.snack.open('Failed to load SMEs', 'Close', { duration: 3000 }); }
    });
  }

  applyFilter(): void { this.loadSmes(); }

  clearFilters(): void {
    this.searchTerm = ''; this.selectedStatus = ''; this.loadSmes();
  }

  openAddDialog(): void {
    const ref = this.dialog.open(SmeFormDialogComponent, { width: '680px', data: null });
    ref.afterClosed().subscribe(result => { if (result) this.loadSmes(); });
  }

  openEditDialog(sme: Sme): void {
    const ref = this.dialog.open(SmeFormDialogComponent, { width: '680px', data: sme });
    ref.afterClosed().subscribe(result => { if (result) this.loadSmes(); });
  }

  deleteSme(sme: Sme): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remove SME', message: `Remove "${sme.fullName}" from the database?`, confirmText: 'Remove', danger: true }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.smeService.delete(sme.id).subscribe({
          next: () => { this.snack.open('SME removed', 'Close', { duration: 3000 }); this.loadSmes(); },
          error: () => this.snack.open('Failed to remove SME', 'Close', { duration: 3000 })
        });
      }
    });
  }

  getInitials(name: string): string { return name ? name[0].toUpperCase() : '?'; }
  getAvailColor(s: AvailabilityStatus): string {
    const m: Record<string, string> = { AVAILABLE: '#1A8240', BOOKED: '#C22626', PENDING: '#BE780E', ON_HOLD: '#6838A8', INACTIVE: '#5C728C' };
    return m[s] ?? '#5C728C';
  }
}
