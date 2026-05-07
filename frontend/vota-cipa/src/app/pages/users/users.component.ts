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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h2>Gestão de Usuários</h2>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>add</mat-icon> Novo Usuário
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-content>
          <h3>{{ editing ? 'Editar' : 'Novo' }} Usuário</h3>
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
              <mat-label>Senha</mat-label>
              <input matInput [(ngModel)]="form.password" type="password" [required]="!editing">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Perfil</mat-label>
              <mat-select [(ngModel)]="form.role">
                <mat-option [value]="1">Administrador</mat-option>
                <mat-option [value]="2">Votação</mat-option>
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
        <table mat-table [dataSource]="users" class="full-width">
          <ng-container matColumnDef="registration">
            <th mat-header-cell *matHeaderCellDef>Matrícula</th>
            <td mat-cell *matCellDef="let u">{{ u.registration }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nome</th>
            <td mat-cell *matCellDef="let u">{{ u.name }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Perfil</th>
            <td mat-cell *matCellDef="let u">{{ u.role === 'Admin' ? 'Administrador' : 'Votação' }}</td>
          </ng-container>
          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Ativo</th>
            <td mat-cell *matCellDef="let u">
              <mat-slide-toggle [checked]="u.active" (change)="toggleActive(u)" color="primary"></mat-slide-toggle>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button color="primary" (click)="edit(u)"><mat-icon>edit</mat-icon></button>
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
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  editing = false;
  editId = 0;
  form = { registration: '', name: '', email: '', password: '', role: 2 };
  displayedColumns = ['registration', 'name', 'email', 'role', 'active', 'actions'];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getUsers().subscribe(data => this.users = data);
  }

  edit(u: User): void {
    this.editing = true;
    this.editId = u.id;
    this.form = { registration: u.registration, name: u.name, email: u.email, password: '', role: u.role === 'Admin' ? 1 : 2 };
    this.showForm = true;
  }

  save(): void {
    if (this.editing) {
      const data: any = { name: this.form.name, email: this.form.email, role: this.form.role };
      if (this.form.password) data.password = this.form.password;
      this.api.updateUser(this.editId, data).subscribe({
        next: () => { this.load(); this.cancelForm(); this.snackBar.open('Usuário atualizado', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    } else {
      this.api.createUser(this.form).subscribe({
        next: () => { this.load(); this.cancelForm(); this.snackBar.open('Usuário criado', 'Fechar', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
      });
    }
  }

  toggleActive(u: User): void {
    this.api.updateUser(u.id, { active: !u.active }).subscribe({
      next: () => this.load(),
      error: (err) => this.snackBar.open(err.error?.message || 'Erro', 'Fechar', { duration: 3000 })
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = false;
    this.editId = 0;
    this.form = { registration: '', name: '', email: '', password: '', role: 2 };
  }
}
