import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User, CreateUserRequest,
  ElectoralPeriod, CreateElectoralPeriodRequest,
  Candidate, CreateCandidateRequest,
  CastVoteRequest, CountingResponse
} from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, request);
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Electoral Periods
  getElectoralPeriods(): Observable<ElectoralPeriod[]> {
    return this.http.get<ElectoralPeriod[]>(`${this.baseUrl}/electoralperiods`);
  }

  getElectoralPeriod(id: number): Observable<ElectoralPeriod> {
    return this.http.get<ElectoralPeriod>(`${this.baseUrl}/electoralperiods/${id}`);
  }

  createElectoralPeriod(request: CreateElectoralPeriodRequest): Observable<ElectoralPeriod> {
    return this.http.post<ElectoralPeriod>(`${this.baseUrl}/electoralperiods`, request);
  }

  updateElectoralPeriod(id: number, data: any): Observable<ElectoralPeriod> {
    return this.http.put<ElectoralPeriod>(`${this.baseUrl}/electoralperiods/${id}`, data);
  }

  deleteElectoralPeriod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/electoralperiods/${id}`);
  }

  // Candidates
  getCandidatesByPeriod(periodId: number): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}/candidates/period/${periodId}`);
  }

  createCandidate(request: CreateCandidateRequest): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.baseUrl}/candidates`, request);
  }

  updateCandidate(id: number, data: any): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.baseUrl}/candidates/${id}`, data);
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/candidates/${id}`);
  }

  // Voting
  castVote(request: CastVoteRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/voting`, request);
  }

  checkVote(periodId: number, registration: string): Observable<{ hasVoted: boolean }> {
    return this.http.get<{ hasVoted: boolean }>(`${this.baseUrl}/voting/check/${periodId}/${registration}`);
  }

  // Counting
  getPartialCounting(periodId: number): Observable<CountingResponse> {
    return this.http.get<CountingResponse>(`${this.baseUrl}/counting/partial/${periodId}`);
  }

  getFinalCounting(periodId: number): Observable<CountingResponse> {
    return this.http.get<CountingResponse>(`${this.baseUrl}/counting/final/${periodId}`);
  }
}
