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
 * Cria uma nova marca
 * @param {{ nome: string }} payload
 */
export async function criarMarca(payload) {
  // payload: { nome }
  const res = await api.post("/marcas", payload);
  return res.data;
}

/**
 * Atualiza uma marca
 * @param {string|number} id
 * @param {{ nome: string }} payload
 */
export async function atualizarMarca(id, payload) {
  const res = await api.put(`/marcas/${id}`, payload);
  return res.data;
}

/**
 * Remove uma marca
 * @param {string|number} id
 */
export async function removerMarca(id) {
  const res = await api.delete(`/marcas/${id}`);
  return res.data;
}

// Aliases for backward compatibility
export { criarMarca as adicionarMarca };
export { atualizarMarca as editarMarca };
export { removerMarca as deletarMarca };
