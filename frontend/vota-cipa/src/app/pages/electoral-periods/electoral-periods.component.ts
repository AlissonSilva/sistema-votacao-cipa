import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { ElectoralPeriod } from '../../models/interfaces';

@Component({
  selector: 'app-electoral-periods',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatChipsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h2>Períodos Eleitorais</h2>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>add</mat-icon> Novo Período
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-content>
          <h3>{{ editing ? 'Editar' : 'Novo' }} Período Eleitoral</h3>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput [(ngModel)]="form.name" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Descrição</mat-label>
              <input matInput [(ngModel)]="form.description">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Data Início</mat-label>
              <input matInput type="datetime-local" [(ngModel)]="form.startDate" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Data Fim</mat-label>
              <input matInput type="datetime-local" [(ngModel)]="form.endDate" required>
            </mat-form-field>
            <mat-form-field appearance="outline" *ngIf="editing">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="form.status">
                <mat-option [value]="1">Criado</mat-option>
                <mat-option [value]="2">Aberto</mat-option>
                <mat-option [value]="3">Fechado</mat-option>
                <mat-option [value]="4">Finalizado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button (click)="cancelForm()">Cancelar</button>
            <button mat-raised-button color="primary" (click)="save()">Salvar</button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <table mat-table [dataSource]="periods" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let ep">{{ ep.name }}</td>
          </ng-container>
          <ng-container matColumnDef="startDate">
            <th mat-header-cell *matHeaderCellDef>Início</th>
            <td mat-cell *matCellDef="let ep">{{ ep.startDate | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>
          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef>Fim</th>
            <td mat-cell *matCellDef="let ep">{{ ep.endDate | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let ep">
              <span class="status-chip" [ngClass]="'status-' + ep.status.toLowerCase()">{{ getStatusLabel(ep.status) }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="candidates">
            <th mat-header-cell *matHeaderCellDef>Candidatos</th>
            <td mat-cell *matCellDef="let ep">{{ ep.candidateCount }}</td>
          </ng-container>
          <ng-container matColumnDef="votes">
            <th mat-header-cell *matHeaderCellDef>Votos</th>
            <td mat-cell *matCellDef="let ep">{{ ep.voteCount }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let ep">
              <button mat-icon-button color="primary" (click)="edit(ep)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(ep)" [disabled]="ep.status !== 'Created'"><mat-icon>delete</mat-icon></button>
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
    .form-card { margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .table-card { overflow: auto; }
    .full-width { width: 100%; }
    .status-chip { padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; }
    .status-created { background: #e3f2fd; color: #1565c0; }
    .status-open { background: #e8f5e9; color: #2e7d32; }
    .status-closed { background: #fff3e0; color: #e65100; }
    .status-finalized { background: #f3e5f5; color: #6a1b9a; }
  `]
})
export class ElectoralPeriodsComponent implements OnInit {
  periods: ElectoralPeriod[] = [];
  showForm = false;
  editing = false;
  editId = 0;
  form = { name: '', description: '', startDate: '', endDate: '', status: 1 };
  displayedColumns = ['name', 'startDate', 'endDate', 'status', 'candidates', 'votes', 'actions'];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getElectoralPeriods().subscribe(data => this.periods = data);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { Created: 'Criado', Open: 'Aberto', Closed: 'Fechado', Finalized: 'Finalizado' };
    return labels[status] || status;
  }

  edit(ep: ElectoralPeriod): void {
    this.editing = true;
    this.editId = ep.id;
    this.form = {
      name: ep.name,
      description: ep.description,
      startDate: ep.startDate.substring(0, 16),
      endDate: ep.endDate.substring(0, 16),
      status: this.getStatusValue(ep.status)
    };
    this.showForm = true;
  }

  getStatusValue(status: string): number {
    const values: Record<string, number> = { Created: 1, Open: 2, Closed: 3, Finalized: 4 };
    return values[status] || 1;
  }

  save(): void {
    if (this.editing) {
      this.api.updateElectoralPeriod(this.editId, { ...this.form, status: this.form.status }).subscribe({
        next: () => { this.load(); this.cancelForm(); this.snackBar.open('Período atualizado', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    } else {
      this.api.createElectoralPeriod(this.form).subscribe({
        next: () => { this.load(); this.cancelForm(); this.snackBar.open('Período criado', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    }
  }

  delete(ep: ElectoralPeriod): void {
    if (confirm('Deseja excluir este período?')) {
      this.api.deleteElectoralPeriod(ep.id).subscribe({
        next: () => { this.load(); this.snackBar.open('Período excluído', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = false;
    this.editId = 0;
    this.form = { name: '', description: '', startDate: '', endDate: '', status: 1 };
  }
}
