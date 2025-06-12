import React from "react";

// Recebe: subcategorias, custosAtivos (objeto {id: true/false}), onToggleCusto (função)
export default function DespesasFixasModal({
  subcategorias = [],
  custosAtivos = {},
  onToggleCusto,
}) {
  if (!subcategorias.length) {
    return (
      <div style={{ color: "#fff", fontSize: 18, margin: 22 }}>
        Nenhuma subcategoria encontrada!
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8, minWidth: 380, color: "#fff" }}>
      {subcategorias.map((subcat, i) => (
        <div key={i} style={{ marginBottom: 22 }}>
          <div style={{
            fontWeight: 800,
            fontSize: 19,
            color: "#ffe95c",
            marginBottom: 4
          }}>
            {subcat.nome}
          </div>
          {(!subcat.despesas || subcat.despesas.length === 0) && (
            <div style={{
              color: "#bdbadd",
              fontWeight: 600,
              fontSize: 15,
              marginLeft: 6
            }}>
              Nenhum custo cadastrado.
            </div>
          )}
          {subcat.despesas && subcat.despesas.map((custo, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 3,
                marginLeft: 14,
              }}
            >
              <input
                type="checkbox"
                checked={!!custosAtivos[`${subcat.nome}-${custo.nome}`]}
                onChange={() => onToggleCusto(`${subcat.nome}-${custo.nome}`)}
                style={{ accentColor: "#ffd76f", width: 19, height: 19 }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: "#bfa9ff"
                }}
              >{custo.nome}</span>
              <span
                style={{
                  fontWeight: 800,
                  marginLeft: 8,
                  color: "#b388ff"
                }}
              >
                - R$ {custo.valor}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}