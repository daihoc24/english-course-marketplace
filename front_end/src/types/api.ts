export type ApiResponse<T> = {
  code: number;
  message: string;
  result: T;
};

export type LoginRequest = { email: string; password: string };
export type LoginSession = {
  token: string;
  role?: string;
  currentUser?: { id: number; email?: string; fullName?: string };
};

export type PaymentUrlResponse = ApiResponse<string>;
