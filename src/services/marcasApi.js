// src/services/marcasApi.js
import api, { API_URL } from "./api"; // <- usa o cliente axios central

export async function listarMarcas() {
  const { data } = await api.get(`${API_URL}/marcas`);
  return data;
}

export async function adicionarMarca(nome) {
  const { data } = await api.post(`${API_URL}/marcas`, { nome });
  return data;
}

export async function deletarMarca(id) {
  const resp = await api.delete(`${API_URL}/marcas/${id}`);
  return resp.status === 200 || resp.status === 204;
}

export async function editarMarca(id, novoNome) {
  const { data } = await api.put(`${API_URL}/marcas/${id}`, { nome: novoNome });
  return data;
}
