export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  grade: number;
  createdAt: string;
}

export interface RegisterEmployeeRequest {
  email: string;
  password: string;
  name: string;
  grade: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  memberIds: string[];
}
