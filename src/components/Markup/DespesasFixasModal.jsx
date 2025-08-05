import React from "react";

// Função para converter valor string ou number para number real
function parseValor(valor) {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    // remove pontos de milhar e troca vírgula por ponto
    const limpo = valor.replace(/\./g, "").replace(",", ".");
    const n = Number(limpo);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export default function DespesasFixasModal({
  subcategorias = [],
  custosAtivos = {},
  onToggleCusto,
  ToggleComponent = () => null
}) {
  return (
    <div style={{ marginTop: 10 }}>
      {subcategorias && subcategorias.length > 0 ? (
        subcategorias.map((subcat, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{
              color: "#97a7c3",                // Cinza azulado
              fontWeight: 800,
              fontSize: "1.08rem",
              marginBottom: 3,
              marginTop: i === 0 ? 0 : 12
            }}>
              {subcat.nome}
            </div>
            {(subcat.despesas && subcat.despesas.length > 0) ? (
              subcat.despesas.map((custo, idx) => {
                const id = `${subcat.nome}-${custo.nome}`;
                const ativo = !!custosAtivos[id];
                return (
                  <div key={id} className="markupideal-listitem">
                    <ToggleComponent
                      checked={ativo}
                      onChange={() => onToggleCusto(id)}
                    />
                    <span className="markupideal-listitem-nome" style={{ flex: 1 }}>
                      {custo.nome}
                    </span>
                    <span className="markupideal-listitem-valor">
                      {parseValor(custo.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{
                color: "#97a7c3",            // Cinza azulado
                fontWeight: 700,
                opacity: 1,
                fontSize: "1rem",
                marginLeft: 2,
                marginBottom: 4
              }}>
                Nenhum custo cadastrado.
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={{
          color: "#97a7c3",                // Cinza azulado
          fontWeight: 700,
          opacity: 1,
          fontSize: "1rem",
          marginLeft: 2
        }}>
          Nenhuma subcategoria de despesa cadastrada.
        </div>
      )}
    </div>
  );
}
