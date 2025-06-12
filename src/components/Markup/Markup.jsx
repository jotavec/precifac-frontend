import React from "react";
import MarkupIdeal from "./MarkupIdeal";

// Exemplo de array de subcategorias (pode puxar do backend depois)
const despesasFixasSubcats = [
  {
    nome: "Administrativas",
    despesas: [
      { nome: "Aluguel", valor: "1500,00" },
      { nome: "Energia", valor: "200,00" }
    ]
  },
  {
    nome: "Operacionais",
    despesas: [
      { nome: "Telefone", valor: "180,00" }
    ]
  }
];

export default function Markup() {
  return (
    <MarkupIdeal despesasFixasSubcats={despesasFixasSubcats} />
  );
}
