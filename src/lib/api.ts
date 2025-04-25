import axios from "axios";
import {
  CreateTeamRequest,
  LoginRequest,
  LoginResponse,
  RegisterEmployeeRequest,
  Team,
  TeamDetail,
  User,
} from "../types/auth";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle data wrapper
api.interceptors.response.use(
  (response: any) => {
    // 응답이 { data: { data: actualData } } 형태인 경우를 처리
    if (response.data && typeof response.data === "object" && "data" in response.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<any>("/auth/login", data);
  return response.data;
};

export const registerEmployee = async (data: RegisterEmployeeRequest): Promise<User> => {
  const response = await api.post<any>("/employees", data);
  return response.data;
};

export const createTeam = async (data: CreateTeamRequest): Promise<Team> => {
  console.log("Creating team with data:", data);
  const response = await api.post<any>("/teams", data);
  return response.data;
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get<any>("/teams");
  return response.data;
};

export const getEmployees = async (): Promise<User[]> => {
  const response = await api.get<any>("/employees");
  return response.data;
};

export const getTeam = async (id: string): Promise<TeamDetail> => {
  const response = await axios.get<any>(`${API_BASE_URL}/teams/${id}`);
  return response.data;
};
