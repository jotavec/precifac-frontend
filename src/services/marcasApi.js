// src/services/marcasApi.js
import api, { API_PREFIX } from "./api"; // <- usa o cliente axios central

export async function listarMarcas() {
  const { data } = await api.get(`${API_PREFIX}/marcas`);
  return data;
}

export async function adicionarMarca(nome) {
  const { data } = await api.post(`${API_PREFIX}/marcas`, { nome });
  return data;
}

export async function deletarMarca(id) {
  const resp = await api.delete(`${API_PREFIX}/marcas/${id}`);
  return resp.status === 200 || resp.status === 204;
}

export async function editarMarca(id, novoNome) {
  const { data } = await api.put(`${API_PREFIX}/marcas/${id}`, { nome: novoNome });
  return data;
}
