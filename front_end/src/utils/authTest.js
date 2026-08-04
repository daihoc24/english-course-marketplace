import axiosClient from "../API/axiosClient";
import { readStoredSession } from "./session";

export const testAuthentication = async () => {
  const session = readStoredSession();
  if (!session?.token) {
    return { success: false, error: "No token found" };
  }

  try {
    const response = await axiosClient.get("/users/myInfo");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const testSellerEndpoint = async (sellerId) => {
  const session = readStoredSession();
  if (!session?.token) {
    return { success: false, error: "No token found" };
  }

  try {
    const response = await axiosClient.get(`/seller/${sellerId}/courses`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
