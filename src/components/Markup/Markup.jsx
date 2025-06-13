import React, { useState, useEffect } from "react";
import MarkupIdeal from "./MarkupIdeal";

// Componente responsável por gerenciar o estado das despesas fixas e repassar para MarkupIdeal.
// Todas as funções de adicionar/editar/remover custo DEVEM passar por aqui para atualizar o estado e o localStorage.
export default function Markup() {
  const [despesasFixasSubcats, setDespesasFixasSubcats] = useState([]);

  // Carrega as subcategorias do localStorage ao montar o componente
  useEffect(() => {
    const categorias = JSON.parse(localStorage.getItem("categoriasCustos2") || "[]");
    setDespesasFixasSubcats(categorias[0]?.subcategorias || []);
  }, []);

  // Adiciona um novo custo dentro de uma subcategoria
  function adicionarCusto(subcatNome, novoCusto) {
    setDespesasFixasSubcats(prev => {
      const novas = prev.map(subcat =>
        subcat.nome === subcatNome
          ? { ...subcat, despesas: [...(subcat.despesas || []), novoCusto] }
          : subcat
      );
      // Atualiza localStorage para persistir
      const categorias = JSON.parse(localStorage.getItem("categoriasCustos2") || "[]");
      if (categorias[0]) categorias[0].subcategorias = novas;
      localStorage.setItem("categoriasCustos2", JSON.stringify(categorias));
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
      const categorias = JSON.parse(localStorage.getItem("categoriasCustos2") || "[]");
      if (categorias[0]) categorias[0].subcategorias = novas;
      localStorage.setItem("categoriasCustos2", JSON.stringify(categorias));
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
      const categorias = JSON.parse(localStorage.getItem("categoriasCustos2") || "[]");
      if (categorias[0]) categorias[0].subcategorias = novas;
      localStorage.setItem("categoriasCustos2", JSON.stringify(categorias));
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