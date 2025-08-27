// src/services/categoriasApi.js
import api from "./api";

export async function listarCategorias() {
  const { data } = await api.get("/categorias");
  return data;
}

export async function adicionarCategoria(nome) {
  const { data } = await api.post("/categorias", { nome });
  return data;
}

export async function deletarCategoria(id) {
  const resp = await api.delete(`/categorias/${id}`);
  return resp.status === 200 || resp.status === 204;
}

export async function editarCategoria(id, novoNome) {
  const { data } = await api.put(`/categorias/${id}`, { nome: novoNome });
  return data;
}

export async function listarCategoriasProduto() {
  const { data } = await api.get("/catalogo/categorias-produto");
  return data;
}
