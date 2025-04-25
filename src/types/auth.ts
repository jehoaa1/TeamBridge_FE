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

export interface Member {
  _id: string;
  id: string;
  email: string;
  name: string;
  age: number;
  position: string;
  hireDate: string;
  emergencyContact: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export interface TeamDetail extends Team {
  members: Member[];
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  memberIds: string[];
}
