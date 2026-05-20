import axios from "axios";
import { RoomResponse } from "../types/RoomSocket";
import { gameCatalog } from "../main";

const API_URL = "https://playu.orchfr.duckdns.org/api/v1";

//http://localhost:3000/api/v1/
//https://playu.orchfr.duckdns.org/api/v1
export const createRoomService = async (): Promise<RoomResponse> => {
  const res = await axios.post<RoomResponse>(`${API_URL}/room`);
  return res.data;
};

export const sendCatalogToBackend = async (): Promise<void> => {
  try {
    // Enviamos exclusivamente la información del catálogo al nuevo endpoint
    await axios.post(`${API_URL}/room/catalog`, {
      gamesCatalog: gameCatalog,
    });
    console.log("Catálogo enviado con éxito al servidor.");
  } catch (error) {
    console.error("Error al enviar el catálogo por Axios:", error);
  }
};
