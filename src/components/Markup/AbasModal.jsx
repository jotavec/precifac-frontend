import React from "react";

const abas = [
  { id: "despesas", label: "Despesas Fixas" },
  { id: "folha", label: "Folha de Pagamento" },
  { id: "encargos", label: "Encargos sobre Venda" },
];

export default function AbasModal({ selected, onAbaChange }) {
  return (
    <div style={{
      display: "flex",
      gap: 0,
      borderBottom: "2.5px solid #4b396b",
      marginBottom: 18,
      background: "none"
    }}>
      {abas.map(aba => (
        <button
          key={aba.id}
          onClick={() => onAbaChange(aba.id)}
          style={{
            padding: "15px 35px",
            border: "none",
            background: selected === aba.id ? "#2c2442" : "#1a1232",
            color: "#FFD76F",
            fontWeight: 800,
            fontSize: 19,
            cursor: "pointer",
            borderBottom: selected === aba.id ? "4px solid #FFD76F" : "none",
            borderRadius: "18px 18px 0 0",
            marginRight: 3,
            outline: "none",
            transition: "all .17s"
          }}
        >
          {aba.label}
        </button>
      ))}
    </div>
  );
}