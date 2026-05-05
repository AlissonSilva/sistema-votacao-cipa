import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span>VotaCipa - Sistema de Votação CIPA</span>
      <span class="spacer"></span>
      <span class="user-name" *ngIf="authService.getUser()">{{ authService.getUser()?.name }}</span>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/voting" routerLinkActive="active">
            <mat-icon matListItemIcon>how_to_vote</mat-icon>
            <span matListItemTitle>Votação</span>
          </a>
          <ng-container *ngIf="authService.isAdmin()">
            <a mat-list-item routerLink="/electoral-periods" routerLinkActive="active">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Períodos Eleitorais</span>
            </a>
            <a mat-list-item routerLink="/candidates" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Candidatos</span>
            </a>
            <a mat-list-item routerLink="/counting" routerLinkActive="active">
              <mat-icon matListItemIcon>bar_chart</mat-icon>
              <span matListItemTitle>Apuração</span>
            </a>
            <a mat-list-item routerLink="/users" routerLinkActive="active">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Usuários</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="content">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .toolbar { position: fixed; top: 0; z-index: 1000; }
    .spacer { flex: 1 1 auto; }
    .user-name { margin-right: 16px; font-size: 14px; }
    .sidenav-container { height: calc(100vh - 64px); margin-top: 64px; }
    .sidenav { width: 240px; }
    .content { padding: 24px; }
    .active { background-color: rgba(0,0,0,0.04); }
  `]
})
export class LayoutComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
