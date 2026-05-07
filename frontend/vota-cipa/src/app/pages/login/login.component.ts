import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="logo-icon">how_to_vote</mat-icon>
            VotaCipa
          </mat-card-title>
          <mat-card-subtitle>Sistema de Votação CIPA</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Matrícula</mat-label>
              <input matInput [(ngModel)]="registration" name="registration" required>
              <mat-icon matPrefix>badge</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput [(ngModel)]="password" name="password" type="password" required>
              <mat-icon matPrefix>lock</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width login-btn" [disabled]="loading">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
    .login-card { width: 400px; padding: 24px; }
    .full-width { width: 100%; }
    .login-btn { margin-top: 16px; height: 48px; font-size: 16px; }
    .logo-icon { font-size: 32px; height: 32px; width: 32px; margin-right: 8px; vertical-align: middle; }
    mat-card-header { margin-bottom: 24px; }
  `]
})
export class LoginComponent {
  registration = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  onLogin(): void {
    if (!this.registration || !this.password) return;
    this.loading = true;

    this.authService.login({ registration: this.registration, password: this.password }).subscribe({
      next: () => {
        const user = this.authService.getUser();
        if (user?.role === 'Admin') {
          this.router.navigate(['/electoral-periods']);
        } else {
          this.router.navigate(['/voting']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erro ao fazer login', 'Fechar', { duration: 3000 });
      }
    });
  }
}
