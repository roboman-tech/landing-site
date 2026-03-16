import axios from "axios";

export default function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.response?.data?.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Request failed. Please try again.";
}
