import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { ElectoralPeriod, Candidate } from '../../models/interfaces';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatStepperModule, LayoutComponent],
  template: `
    <app-layout>
      <h2>Votação CIPA</h2>

      <mat-card class="voting-card">
        <mat-card-content>
          <!-- Step 1: Select period and enter registration -->
          <div *ngIf="step === 1">
            <h3>Identificação do Votante</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Período Eleitoral</mat-label>
              <mat-select [(ngModel)]="selectedPeriodId" (selectionChange)="loadCandidates()">
                <mat-option *ngFor="let p of openPeriods" [value]="p.id">{{ p.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sua Matrícula</mat-label>
              <input matInput [(ngModel)]="voterRegistration" required>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="checkAndProceed()" [disabled]="!selectedPeriodId || !voterRegistration">
              Próximo
            </button>
          </div>

          <!-- Step 2: Select candidate -->
          <div *ngIf="step === 2">
            <h3>Escolha seu Candidato</h3>
            <p class="info-text">Período: {{ getSelectedPeriodName() }} | Matrícula: {{ voterRegistration }}</p>
            <div class="candidates-grid">
              <mat-card *ngFor="let c of candidates"
                        class="candidate-card"
                        [class.selected]="selectedCandidateId === c.id"
                        (click)="selectCandidate(c.id)">
                <mat-card-content class="candidate-content">
                  <mat-icon class="candidate-icon">person</mat-icon>
                  <h4>{{ c.name }}</h4>
                  <p>{{ c.department }}</p>
                  <p class="registration">Matrícula: {{ c.registration }}</p>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="voting-actions">
              <button mat-button (click)="step = 1">Voltar</button>
              <button mat-raised-button color="primary" (click)="step = 3" [disabled]="!selectedCandidateId">
                Confirmar Voto
              </button>
            </div>
          </div>

          <!-- Step 3: Confirm -->
          <div *ngIf="step === 3">
            <h3>Confirmação do Voto</h3>
            <mat-card class="confirm-card">
              <p><strong>Período:</strong> {{ getSelectedPeriodName() }}</p>
              <p><strong>Sua Matrícula:</strong> {{ voterRegistration }}</p>
              <p><strong>Candidato:</strong> {{ getSelectedCandidateName() }}</p>
            </mat-card>
            <p class="warning-text">Atenção: Após confirmar, o voto não poderá ser alterado!</p>
            <div class="voting-actions">
              <button mat-button (click)="step = 2">Voltar</button>
              <button mat-raised-button color="warn" (click)="confirmVote()">
                Confirmar Voto
              </button>
            </div>
          </div>

          <!-- Step 4: Success -->
          <div *ngIf="step === 4" class="success-container">
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h3>Voto Registrado com Sucesso!</h3>
            <p>Obrigado por participar da eleição CIPA.</p>
            <button mat-raised-button color="primary" (click)="reset()">Nova Votação</button>
          </div>
        </mat-card-content>
      </mat-card>
    </app-layout>
  `,
  styles: [`
    .voting-card { max-width: 800px; margin: 0 auto; }
    .full-width { width: 100%; }
    .candidates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin: 16px 0; }
    .candidate-card { cursor: pointer; transition: all 0.2s; text-align: center; }
    .candidate-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
    .candidate-card.selected { border: 3px solid #3f51b5; background: #e8eaf6; }
    .candidate-content { padding: 16px; }
    .candidate-icon { font-size: 48px; height: 48px; width: 48px; color: #3f51b5; }
    .registration { font-size: 12px; color: #666; }
    .voting-actions { display: flex; justify-content: space-between; margin-top: 24px; }
    .confirm-card { padding: 24px; margin: 16px 0; background: #f5f5f5; }
    .warning-text { color: #f44336; font-weight: 500; margin-top: 16px; }
    .success-container { text-align: center; padding: 48px; }
    .success-icon { font-size: 72px; height: 72px; width: 72px; color: #4caf50; }
    .info-text { color: #666; margin-bottom: 16px; }
  `]
})
export class VotingComponent implements OnInit {
  openPeriods: ElectoralPeriod[] = [];
  candidates: Candidate[] = [];
  selectedPeriodId: number | null = null;
  selectedCandidateId: number | null = null;
  voterRegistration = '';
  step = 1;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getElectoralPeriods().subscribe(data => {
      this.openPeriods = data.filter(p => p.status === 'Open');
    });
  }

  loadCandidates(): void {
    if (this.selectedPeriodId) {
      this.api.getCandidatesByPeriod(this.selectedPeriodId).subscribe(data => this.candidates = data);
    }
  }

  checkAndProceed(): void {
    if (!this.selectedPeriodId || !this.voterRegistration) return;
    this.api.checkVote(this.selectedPeriodId, this.voterRegistration).subscribe({
      next: (res) => {
        if (res.hasVoted) {
          this.snackBar.open('Esta matrícula já votou neste período', 'Fechar', { duration: 3000 });
        } else {
          this.step = 2;
        }
      },
      error: () => this.step = 2
    });
  }

  selectCandidate(id: number): void {
    this.selectedCandidateId = id;
  }

  getSelectedPeriodName(): string {
    return this.openPeriods.find(p => p.id === this.selectedPeriodId)?.name || '';
  }

  getSelectedCandidateName(): string {
    return this.candidates.find(c => c.id === this.selectedCandidateId)?.name || '';
  }

  confirmVote(): void {
    this.api.castVote({
      electoralPeriodId: this.selectedPeriodId!,
      candidateId: this.selectedCandidateId!,
      voterRegistration: this.voterRegistration
    }).subscribe({
      next: () => this.step = 4,
      error: (err) => this.snackBar.open(err.error?.message || 'Erro ao votar', 'Fechar', { duration: 3000 })
    });
  }

  reset(): void {
    this.step = 1;
    this.selectedPeriodId = null;
    this.selectedCandidateId = null;
    this.voterRegistration = '';
    this.candidates = [];
  }
}
