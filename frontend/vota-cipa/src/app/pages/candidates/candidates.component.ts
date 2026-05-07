import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { ElectoralPeriod, Candidate } from '../../models/interfaces';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h2>Candidatos</h2>
        <button mat-raised-button color="primary" (click)="showForm = !showForm" [disabled]="!selectedPeriodId">
          <mat-icon>add</mat-icon> Novo Candidato
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-form-field appearance="outline">
          <mat-label>Período Eleitoral</mat-label>
          <mat-select [(ngModel)]="selectedPeriodId" (selectionChange)="loadCandidates()">
            <mat-option *ngFor="let p of periods" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-content>
          <h3>{{ editing ? 'Editar' : 'Novo' }} Candidato</h3>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Matrícula</mat-label>
              <input matInput [(ngModel)]="form.registration" [disabled]="editing" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput [(ngModel)]="form.name" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="form.email" type="email" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Departamento</mat-label>
              <input matInput [(ngModel)]="form.department" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>URL da Foto</mat-label>
              <input matInput [(ngModel)]="form.photoUrl">
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button (click)="cancelForm()">Cancelar</button>
            <button mat-raised-button color="primary" (click)="save()">Salvar</button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card" *ngIf="selectedPeriodId">
        <table mat-table [dataSource]="candidates" class="full-width">
          <ng-container matColumnDef="registration">
            <th mat-header-cell *matHeaderCellDef>Matrícula</th>
            <td mat-cell *matCellDef="let c">{{ c.registration }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c">{{ c.email }}</td>
          </ng-container>
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Departamento</th>
            <td mat-cell *matCellDef="let c">{{ c.department }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" (click)="edit(c)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(c)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </app-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .filter-card { margin-bottom: 16px; padding: 16px; }
    .form-card { margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .table-card { overflow: auto; }
    .full-width { width: 100%; }
  `]
})
export class CandidatesComponent implements OnInit {
  periods: ElectoralPeriod[] = [];
  candidates: Candidate[] = [];
  selectedPeriodId: number | null = null;
  showForm = false;
  editing = false;
  editId = 0;
  form = { registration: '', name: '', email: '', department: '', photoUrl: '' };
  displayedColumns = ['registration', 'name', 'email', 'department', 'actions'];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getElectoralPeriods().subscribe(data => this.periods = data);
  }

  loadCandidates(): void {
    if (this.selectedPeriodId) {
      this.api.getCandidatesByPeriod(this.selectedPeriodId).subscribe(data => this.candidates = data);
    }
  }

  edit(c: Candidate): void {
    this.editing = true;
    this.editId = c.id;
    this.form = { registration: c.registration, name: c.name, email: c.email, department: c.department, photoUrl: c.photoUrl };
    this.showForm = true;
  }

  save(): void {
    if (this.editing) {
      this.api.updateCandidate(this.editId, this.form).subscribe({
        next: () => { this.loadCandidates(); this.cancelForm(); this.snackBar.open('Candidato atualizado', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    } else {
      this.api.createCandidate({ ...this.form, electoralPeriodId: this.selectedPeriodId! }).subscribe({
        next: () => { this.loadCandidates(); this.cancelForm(); this.snackBar.open('Candidato criado', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    }
  }

  delete(c: Candidate): void {
    if (confirm('Deseja excluir este candidato?')) {
      this.api.deleteCandidate(c.id).subscribe({
        next: () => { this.loadCandidates(); this.snackBar.open('Candidato excluído', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = false;
    this.editId = 0;
    this.form = { registration: '', name: '', email: '', department: '', photoUrl: '' };
  }
}
