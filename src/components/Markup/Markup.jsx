import React, { useState, useEffect } from "react";
import MarkupIdeal from "./MarkupIdeal";

// Componente responsável por gerenciar o estado das despesas fixas e repassar para MarkupIdeal.
// Versão sem localStorage.
export default function Markup({ user }) {
  const [despesasFixasSubcats, setDespesasFixasSubcats] = useState([]);

  useEffect(() => {
    // Aqui você deve buscar as categorias do backend usando o user.id
    async function buscarCategorias() {
      if (!user) return;
      try {
        const resp = await fetch(`http://localhost:3000/categorias?userId=${user.id}`);
        const data = await resp.json();
        setDespesasFixasSubcats(data[0]?.subcategorias || []);
      } catch {
        setDespesasFixasSubcats([]);
      }
    }
    buscarCategorias();
  }, [user]);

  // Adiciona um novo custo dentro de uma subcategoria
  function adicionarCusto(subcatNome, novoCusto) {
    setDespesasFixasSubcats(prev => {
      const novas = prev.map(subcat =>
        subcat.nome === subcatNome
          ? { ...subcat, despesas: [...(subcat.despesas || []), novoCusto] }
          : subcat
      );
      // Aqui você deve atualizar via API também
      return novas;
    });
  }

  // Edita um custo existente em uma subcategoria
  function editarCusto(subcatNome, custoAntigoNome, custoEditado) {
    setDespesasFixasSubcats(prev => {
      const novas = prev.map(subcat =>
        subcat.nome === subcatNome
          ? {
              ...subcat,
              despesas: (subcat.despesas || []).map(custo =>
                custo.nome === custoAntigoNome ? custoEditado : custo
              ),
            }
          : subcat
      );
      // Aqui você deve atualizar via API também
      return novas;
    });
  }

  // Remove um custo de uma subcategoria
  function removerCusto(subcatNome, custoNome) {
    setDespesasFixasSubcats(prev => {
      const novas = prev.map(subcat =>
        subcat.nome === subcatNome
          ? {
              ...subcat,
              despesas: (subcat.despesas || []).filter(custo => custo.nome !== custoNome),
            }
          : subcat
      );
      // Aqui você deve atualizar via API também
      return novas;
    });
  }

  // Renderiza o MarkupIdeal, passando as funções para ele ou outros filhos
  return (
    <MarkupIdeal
      despesasFixasSubcats={despesasFixasSubcats}
      adicionarCusto={adicionarCusto}
      editarCusto={editarCusto}
      removerCusto={removerCusto}
    />
  );
}
