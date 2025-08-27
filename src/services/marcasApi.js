// src/services/marcasApi.js
import api from "./api"; // <- usa o cliente axios central

export async function listarMarcas() {
  const { data } = await api.get("/marcas");
  return data;
}

export async function adicionarMarca(nome) {
  const { data } = await api.post("/marcas", { nome });
  return data;
}

export async function deletarMarca(id) {
  const resp = await api.delete(`/marcas/${id}`);
  return resp.status === 200 || resp.status === 204;
}

export async function editarMarca(id, novoNome) {
  const { data } = await api.put(`/marcas/${id}`, { nome: novoNome });
  return data;
}

export async function listarMarcasProduto() {
  const { data } = await api.get("/catalogo/marcas-produto");
  return data;
}
