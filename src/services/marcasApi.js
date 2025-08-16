// src/services/marcasApi.js
// -------------------------------------------------------------
// Cliente de Marcas padronizado usando a instância central `api`.
// - Sem header customizado (nada de "x-user-id").
// - Baseia-se em cookie/JWT já configurado no backend.
// - Endpoints em /api/marcas (ajuste aqui se seu backend for diferente).
// -------------------------------------------------------------

import api from "./api";

/**
 * Lista marcas (com paginação/termo se aplicável)
 * @param {{ page?: number, limit?: number, q?: string }} params
 */
export async function listarMarcas(params = {}) {
  const { page, limit, q } = params;
  const res = await api.get("/marcas", {
    params: { page, limit, q },
    // credentials via axios + withCredentials já vêm do client central
  });
  return res.data;
}

/**
 * Adiciona uma nova marca
 * @param {string} nome - Nome da marca
 */
export async function adicionarMarca(nome) {
  const res = await api.post("/marcas", { nome });
  return res.data;
}

/**
 * Edita uma marca
 * @param {string|number} id
 * @param {string} novoNome
 */
export async function editarMarca(id, novoNome) {
  const res = await api.put(`/marcas/${id}`, { nome: novoNome });
  return res.data;
}

/**
 * Remove uma marca
 * @param {string|number} id
 */
export async function deletarMarca(id) {
  const res = await api.delete(`/marcas/${id}`);
  return res.data;
}
