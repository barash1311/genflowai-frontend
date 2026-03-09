export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Dataset {
  id: string;
  name: string;
  source: string;
  description: string;
  rowCount: number;
  uploadedBy: string;
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  description: string;
  accuracy: number;
  createdAt: string;
}

export interface Prompt {
  id: string;
  userId: string;
  datasetId: string;
  datasetName: string;
  promptText: string;
  createdAt: string;
}

export interface PredictionJobResponse {
  id: string;
  promptId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt: string;
  finishedAt: string | null;
}

export interface Prediction {
  id: string;
  promptId: string;
  modelId: string;
  result: string;
  status: string;
  executionTimeMs: number;
  createdAt: string;
}

export interface PageResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
