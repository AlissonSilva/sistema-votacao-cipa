export interface LoginRequest {
  registration: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  role: string;
}

export interface User {
  id: number;
  registration: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  registration: string;
  name: string;
  email: string;
  password: string;
  role: number;
}

export interface ElectoralPeriod {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  candidateCount: number;
  voteCount: number;
  createdAt: string;
}

export interface CreateElectoralPeriodRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Candidate {
  id: number;
  electoralPeriodId: number;
  registration: string;
  name: string;
  email: string;
  department: string;
  photoUrl: string;
  createdAt: string;
}

export interface CreateCandidateRequest {
  electoralPeriodId: number;
  registration: string;
  name: string;
  email: string;
  department: string;
  photoUrl?: string;
}

export interface CastVoteRequest {
  electoralPeriodId: number;
  candidateId: number;
  voterRegistration: string;
}

export interface CandidateVoteCount {
  candidateId: number;
  candidateName: string;
  registration: string;
  department: string;
  voteCount: number;
  percentage: number;
}

export interface CountingResponse {
  electoralPeriodId: number;
  electoralPeriodName: string;
  status: string;
  totalVotes: number;
  totalCandidates: number;
  results: CandidateVoteCount[];
}
