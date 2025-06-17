import React, { useEffect } from "react";

// Função utilitária para parsear valor monetário (aceita número, "1500,00", "1.500,00", etc)
function parseValor(valor) {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    const limpo = valor.replace(/\./g, "").replace(",", ".");
    const n = Number(limpo);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export default function FolhaPagamentoModal({
  funcionarios = [],
  custosAtivos = {},
  setCustosAtivos,
  ToggleComponent = () => null
}) {
  // Garante que todos venham ativos ao abrir
  useEffect(() => {
    if (!funcionarios?.length) return;
    // Se já estão todos ativos, não faz nada
    const temAlgumDesativado = funcionarios.some(f => {
      const id = f.id ?? f._id ?? f.nome;
      return !custosAtivos[id];
    });
    if (!temAlgumDesativado && Object.keys(custosAtivos).length === funcionarios.length) return;
    // Seta todos como ativos
    const novos = {};
    funcionarios.forEach(f => {
      const id = f.id ?? f._id ?? f.nome;
      novos[id] = true;
    });
    setCustosAtivos(novos);
    // eslint-disable-next-line
  }, [funcionarios]);

  return (
    <div style={{ marginTop: 10 }}>
      {funcionarios && funcionarios.length > 0 ? (
        funcionarios.map((f, idx) => {
          const id = f.id ?? f._id ?? f.nome;
          const ativo = !!custosAtivos[id];
          return (
            <div key={id} className="markupideal-listitem">
              <ToggleComponent
                checked={ativo}
                onChange={() => setCustosAtivos({
                  ...custosAtivos,
                  [id]: !ativo
                })}
              />
              <span className="markupideal-listitem-nome" style={{ flex: 1 }}>
                {f.nome}
              </span>
              <span className="markupideal-listitem-valor">
                {parseValor(f.valor).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </span>
            </div>
          );
        })
      ) : (
        <div style={{
          color: "#ffe060",
          fontWeight: 400,
          opacity: 0.65,
          fontSize: "1rem",
          marginLeft: 2,
          marginBottom: 4
        }}>
          Nenhum funcionário cadastrado.
        </div>
      )}
    </div>
  );
}