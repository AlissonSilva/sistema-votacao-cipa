import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { ElectoralPeriod, CountingResponse } from '../../models/interfaces';

@Component({
  selector: 'app-counting',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatProgressBarModule, MatSnackBarModule, LayoutComponent],
  template: `
    <app-layout>
      <h2>Apuração de Votos</h2>

      <mat-card class="filter-card">
        <mat-form-field appearance="outline">
          <mat-label>Período Eleitoral</mat-label>
          <mat-select [(ngModel)]="selectedPeriodId">
            <mat-option *ngFor="let p of periods" [value]="p.id">{{ p.name }} ({{ p.status }})</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card>

      <mat-tab-group *ngIf="selectedPeriodId">
        <mat-tab label="Apuração Parcial">
          <div class="tab-content">
            <button mat-raised-button color="primary" (click)="loadPartial()" class="load-btn">
              <mat-icon>refresh</mat-icon> Carregar Apuração Parcial
            </button>
            <ng-container *ngIf="partialResult">
              <div class="summary-cards">
                <mat-card class="summary-card">
                  <h4>Total de Votos</h4>
                  <span class="big-number">{{ partialResult.totalVotes }}</span>
                </mat-card>
                <mat-card class="summary-card">
                  <h4>Total de Candidatos</h4>
                  <span class="big-number">{{ partialResult.totalCandidates }}</span>
                </mat-card>
                <mat-card class="summary-card">
                  <h4>Status</h4>
                  <span class="status-text">{{ partialResult.status }}</span>
                </mat-card>
              </div>
              <mat-card class="results-card">
                <h3>Resultado Parcial</h3>
                <div *ngFor="let r of partialResult.results" class="result-row">
                  <div class="result-info">
                    <strong>{{ r.candidateName }}</strong>
                    <span>{{ r.department }} - {{ r.registration }}</span>
                  </div>
                  <div class="result-bar">
                    <mat-progress-bar mode="determinate" [value]="r.percentage"></mat-progress-bar>
                    <span class="vote-count">{{ r.voteCount }} votos ({{ r.percentage }}%)</span>
                  </div>
                </div>
              </mat-card>
            </ng-container>
          </div>
        </mat-tab>
        <mat-tab label="Apuração Final">
          <div class="tab-content">
            <button mat-raised-button color="warn" (click)="loadFinal()" class="load-btn">
              <mat-icon>gavel</mat-icon> Realizar Apuração Final
            </button>
            <p class="warning-text" *ngIf="!finalResult">A apuração final encerra o período eleitoral permanentemente.</p>
            <ng-container *ngIf="finalResult">
              <div class="summary-cards">
                <mat-card class="summary-card">
                  <h4>Total de Votos</h4>
                  <span class="big-number">{{ finalResult.totalVotes }}</span>
                </mat-card>
                <mat-card class="summary-card">
                  <h4>Total de Candidatos</h4>
                  <span class="big-number">{{ finalResult.totalCandidates }}</span>
                </mat-card>
                <mat-card class="summary-card winner">
                  <h4>Vencedor</h4>
                  <span class="winner-name">{{ finalResult.results[0]?.candidateName || 'N/A' }}</span>
                </mat-card>
              </div>
              <mat-card class="results-card">
                <h3>Resultado Final</h3>
                <div *ngFor="let r of finalResult.results; let i = index" class="result-row" [class.winner-row]="i === 0">
                  <div class="result-position">{{ i + 1 }}º</div>
                  <div class="result-info">
                    <strong>{{ r.candidateName }}</strong>
                    <span>{{ r.department }} - {{ r.registration }}</span>
                  </div>
                  <div class="result-bar">
                    <mat-progress-bar mode="determinate" [value]="r.percentage" [color]="i === 0 ? 'accent' : 'primary'"></mat-progress-bar>
                    <span class="vote-count">{{ r.voteCount }} votos ({{ r.percentage }}%)</span>
                  </div>
                </div>
              </mat-card>
            </ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </app-layout>
  `,
  styles: [`
    .filter-card { margin-bottom: 16px; padding: 16px; }
    .tab-content { padding: 24px 0; }
    .load-btn { margin-bottom: 24px; }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { text-align: center; padding: 24px; }
    .summary-card h4 { margin: 0; color: #666; }
    .big-number { font-size: 36px; font-weight: bold; color: #3f51b5; }
    .status-text { font-size: 18px; font-weight: 500; }
    .results-card { padding: 24px; }
    .result-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; gap: 16px; }
    .result-position { font-size: 24px; font-weight: bold; color: #666; min-width: 40px; }
    .result-info { min-width: 200px; }
    .result-info span { display: block; font-size: 12px; color: #666; }
    .result-bar { flex: 1; }
    .vote-count { font-size: 12px; color: #666; margin-top: 4px; display: block; }
    .winner-row { background: #fff8e1; border-radius: 8px; padding: 16px; }
    .winner { border: 2px solid #ffc107; }
    .winner-name { font-size: 20px; font-weight: bold; color: #f57c00; }
    .warning-text { color: #f44336; font-style: italic; }
  `]
})
export class CountingComponent implements OnInit {
  periods: ElectoralPeriod[] = [];
  selectedPeriodId: number | null = null;
  partialResult: CountingResponse | null = null;
  finalResult: CountingResponse | null = null;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getElectoralPeriods().subscribe(data => {
      this.periods = data.filter(p => p.status !== 'Created');
    });
  }

  loadPartial(): void {
    if (!this.selectedPeriodId) return;
    this.api.getPartialCounting(this.selectedPeriodId).subscribe({
      next: (data) => this.partialResult = data,
      error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
    });
  }

  loadFinal(): void {
    if (!this.selectedPeriodId) return;
    if (!confirm('Deseja realizar a apuração final? Esta ação finalizará o período eleitoral.')) return;
    this.api.getFinalCounting(this.selectedPeriodId).subscribe({
      next: (data) => this.finalResult = data,
      error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
    });
  }
}
