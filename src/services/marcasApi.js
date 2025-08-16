// src/services/marcasApi.js
// -------------------------------------------------------------
// Cliente de Marcas padronizado usando a instância central `api`.
// Compatível com nomes antigos (adicionar/editar/deletar) e novos
// (criar/atualizar/remover) para evitar quebrar componentes.
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
  });
  return res.data;
}

/**
 * Cria uma nova marca
 * @param {{ nome: string }} payload
 */
export async function criarMarca(payload) {
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

/* ======== ALIASES de compatibilidade (nomes antigos) ======== */
/** alias para criarMarca */
export const adicionarMarca = criarMarca;
/** alias para atualizarMarca */
export const editarMarca = atualizarMarca;
/** alias para removerMarca */
export const deletarMarca = removerMarca;
