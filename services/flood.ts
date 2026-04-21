import { apiFetch } from './api';

export interface FloodReport {
  id: number;
  kecamatan: string;
  desa: string;
  latitude: number;
  longitude: number;
  severity: 'rendah' | 'sedang' | 'tinggi';
  description: string;
  status: string;
  reported_at: string;
}

export async function getFloodReports(): Promise<FloodReport[]> {
  return apiFetch<FloodReport[]>('/flood-reports');
}

export async function getFloodReportById(id: number): Promise<FloodReport> {
  return apiFetch<FloodReport>(`/flood-reports/${id}`);
}

export async function createFloodReport(
  data: Omit<FloodReport, 'id' | 'reported_at'>
): Promise<FloodReport> {
  return apiFetch<FloodReport>('/flood-reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
