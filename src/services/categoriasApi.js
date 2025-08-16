// src/services/categoriasApi.js
// -------------------------------------------------------------
// Cliente de Categorias padronizado usando a instância central `api`.
// - Sem header customizado (nada de "x-user-id").
// - Baseia-se em cookie/JWT já configurado no backend.
// - Endpoints em /api/categorias (ajuste aqui se seu backend for diferente).
// -------------------------------------------------------------

import api from "./api";

/**
 * Lista categorias
 */
export async function listarCategorias() {
  const res = await api.get("/categorias");
  return res.data;
}

/**
 * Adiciona uma nova categoria
 * @param {string} nome
 */
export async function adicionarCategoria(nome) {
  const res = await api.post("/categorias", { nome });
  return res.data;
}

/**
 * Remove uma categoria
 * @param {string|number} id
 */
export async function deletarCategoria(id) {
  const res = await api.delete(`/categorias/${id}`);
  return res.status === 200 || res.status === 204;
}

/**
 * Edita uma categoria
 * @param {string|number} id
 * @param {string} novoNome
 */
export async function editarCategoria(id, novoNome) {
  const res = await api.put(`/categorias/${id}`, { nome: novoNome });
  return res.data;
}