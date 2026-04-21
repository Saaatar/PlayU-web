import axios from "axios";
import { RoomResponse } from "../types/RoomSocket";

const API_URL = "https://playu.orchfr.duckdns.org/api/v1";

export const createRoomService = async (): Promise<RoomResponse> => {
  const res = await axios.post<RoomResponse>(`${API_URL}/room`);
  return res.data;
};
