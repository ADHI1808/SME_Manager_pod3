// src/app/core/services/sme.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sme, SmeRequest, SmeSummary, AvailabilityStatus } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SmeService {
  private readonly API = `${environment.apiUrl}/admin/smes`;

  constructor(private http: HttpClient) {}

  getAll(name?: string, dept?: string, status?: AvailabilityStatus): Observable<Sme[]> {
    let params = new HttpParams();
    if (name)   params = params.set('name', name);
    if (dept)   params = params.set('dept', dept);
    if (status) params = params.set('status', status);
    return this.http.get<Sme[]>(this.API, { params });
  }

  getById(id: number): Observable<Sme> {
    return this.http.get<Sme>(`${this.API}/${id}`);
  }

  create(req: SmeRequest): Observable<Sme> {
    return this.http.post<Sme>(this.API, req);
  }

  update(id: number, req: SmeRequest): Observable<Sme> {
    return this.http.put<Sme>(`${this.API}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  updateAvailability(id: number, status: AvailabilityStatus): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/availability`, { status });
  }

  findAvailableBySpecialties(specialties: string[]): Observable<SmeSummary[]> {
    const params = new HttpParams().set('specialties', specialties.join(','));
    return this.http.get<SmeSummary[]>(`${this.API}/available`, { params });
  }
}
