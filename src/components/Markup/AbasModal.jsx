import React from "react";

const abas = [
  { id: "despesas", label: "Despesas Fixas" },
  { id: "folha", label: "Folha de Pagamento" },
  { id: "encargos", label: "Encargos sobre Venda" },
];

export default function AbasModal({ selected, onAbaChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "2.5px solid #e1e9f7",
        marginBottom: 18,
        background: "none"
      }}
    >
      {abas.map(aba => {
        const isActive = selected === aba.id;
        return (
          <button
            key={aba.id}
            onClick={() => onAbaChange(aba.id)}
            style={{
              padding: "14px 38px",
              border: "none",
              background: isActive ? "#fff" : "#f6fafd",
              color: isActive ? "#2196f3" : "#8fb9e7",
              fontWeight: 900,
              fontSize: 18,
              cursor: "pointer",
              borderBottom: isActive
                ? "4px solid #2196f3"
                : "2px solid transparent",
              borderTop: isActive
                ? "2.5px solid #2196f3"
                : "2.5px solid transparent",
              borderLeft: isActive
                ? "2.5px solid #2196f3"
                : "2.5px solid transparent",
              borderRight: isActive
                ? "2.5px solid #2196f3"
                : "2.5px solid transparent",
              borderRadius: "15px 15px 0 0",
              marginRight: 6,
              outline: "none",
              boxShadow: isActive
                ? "0 3px 18px #2196f344"
                : "none",
              transition: "all .18s",
              zIndex: isActive ? 2 : 1,
              position: "relative"
            }}
          >
            {aba.label}
          </button>
        );
      })}
    </div>
  );
}
