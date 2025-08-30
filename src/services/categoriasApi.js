// src/services/categoriasApi.js
import api, { API_URL } from "./api";

export async function listarCategorias() {
  const { data } = await api.get(`${API_URL}/categorias`);
  return data;
}

export async function adicionarCategoria(nome) {
  const { data } = await api.post(`${API_URL}/categorias`, { nome });
  return data;
}

export async function deletarCategoria(id) {
  const resp = await api.delete(`${API_URL}/categorias/${id}`);
  return resp.status === 200 || resp.status === 204;
}

export async function editarCategoria(id, novoNome) {
  const { data } = await api.put(`${API_URL}/categorias/${id}`, { nome: novoNome });
  return data;
}
