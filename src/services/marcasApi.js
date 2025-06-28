const API_URL = "http://localhost:3000";

export async function listarMarcas(userId) {
  const resp = await fetch(`${API_URL}/marcas`, {
    headers: { "x-user-id": userId },
  });
  return resp.json();
}

export async function adicionarMarca(nome, userId) {
  const resp = await fetch(`${API_URL}/marcas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ nome, userId }),
  });
  return resp.json();
}

export async function deletarMarca(id, userId) {
  const resp = await fetch(`${API_URL}/marcas/${id}`, {
    method: "DELETE",
    headers: { "x-user-id": userId },
  });
  return resp.ok;
}

export async function editarMarca(id, novoNome, userId) {
  const resp = await fetch(`${API_URL}/marcas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ nome: novoNome, userId }),
  });
  return resp.json();
}
