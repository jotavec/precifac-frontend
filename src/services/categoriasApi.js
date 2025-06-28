const API_URL = "http://localhost:3000";

export async function listarCategorias(userId) {
  const resp = await fetch(`${API_URL}/categorias`, {
    headers: { "x-user-id": userId },
  });
  return resp.json();
}

export async function adicionarCategoria(nome, userId) {
  const resp = await fetch(`${API_URL}/categorias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ nome, userId }),
  });
  return resp.json();
}

export async function deletarCategoria(id, userId) {
  const resp = await fetch(`${API_URL}/categorias/${id}`, {
    method: "DELETE",
    headers: { "x-user-id": userId },
  });
  return resp.ok;
}

export async function editarCategoria(id, novoNome, userId) {
  const resp = await fetch(`${API_URL}/categorias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ nome: novoNome, userId }),
  });
  return resp.json();
}
