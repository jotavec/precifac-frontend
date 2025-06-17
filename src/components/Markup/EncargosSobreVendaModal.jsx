import React from "react";

// Máscara de valor em reais
function maskValueBRLInput(v) {
  v = (v ?? "").toString().replace(/[^\d]/g, "");
  if (v.length === 0) return "0,00";
  while (v.length < 3) v = "0" + v;
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  reais = reais.replace(/^0+/, "") || "0";
  return reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centavos;
}

// Máscara para percentuais
function maskPercentBRLInput(v) {
  v = (v ?? "").toString().replace(/[^\d]/g, "");
  if (v.length === 0) return "0,00";
  while (v.length < 3) v = "0" + v;
  let inteiro = v.slice(0, -2);
  let decimal = v.slice(-2);
  inteiro = inteiro.replace(/^0+/, "") || "0";
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimal;
}

export default function EncargosSobreVendaModal({
  encargosData = {},
  outrosEncargos = [],
  ativos = {},
  onToggle,
  ToggleComponent
}) {
  // Chaves dos encargos fixos (sem creditoParcelado aqui!)
  const CHAVES = [
    { key: "icms", label: "ICMS" },
    { key: "iss", label: "ISS" },
    { key: "pisCofins", label: "PIS/COFINS" },
    { key: "irpjCsll", label: "IRPJ/CSLL" },
    { key: "ipi", label: "IPI" },
    { key: "debito", label: "Taxa Débito" },
    { key: "credito", label: "Taxa Crédito" },
    // As parcelas de crédito vão logo abaixo de "credito"
    { key: "boleto", label: "Taxa Boleto" },
    { key: "pix", label: "Taxa Pix" },
    { key: "gateway", label: "Taxa Gateway" },
    { key: "marketing", label: "Comissão Marketing" },
    { key: "delivery", label: "Comissão Delivery" },
    { key: "saas", label: "Comissão SaaS" },
    { key: "colaboradores", label: "Comissão Colaboradores" }
  ];

  const purple = "#a780ff";
  const parcelas = Array.isArray(encargosData.creditoParcelado)
    ? encargosData.creditoParcelado
    : [];

  return (
    <table className="markup-ideal-table" style={{ width: "100%" }}>
      <tbody>
        {CHAVES.flatMap(({ key, label }) => {
          // Linha padrão
          const percent = encargosData[key]?.percent ?? 0;
          const value = encargosData[key]?.value ?? 0;
          const percentMasked = maskPercentBRLInput(
            Math.round(Number(percent) * 100).toString()
          );
          const valueMasked = maskValueBRLInput(value);

          const mainRow = (
            <tr key={key}>
              <td style={{ width: 56, textAlign: "center" }}>
                <ToggleComponent
                  checked={!!ativos[key]}
                  onChange={() => onToggle(key)}
                />
              </td>
              <td style={{ color: "#fff", fontWeight: 500 }}>{label}</td>
              <td style={{ width: 90, textAlign: "right" }}>
                <span
                  style={{
                    color: purple,
                    fontWeight: 700,
                    minWidth: 60
                  }}
                >
                  {percentMasked} %
                </span>
              </td>
              <td style={{ width: 120, textAlign: "right" }}>
                <span
                  style={{
                    color: purple,
                    fontWeight: 700,
                    minWidth: 60
                  }}
                >
                  R$ {valueMasked}
                </span>
              </td>
            </tr>
          );

          // Após "credito", renderizar as parcelas logo abaixo
          if (key === "credito" && parcelas.length > 0) {
            const parcelasRows = parcelas.map((parcela, pIdx) => {
              const parcelaKey = `creditoParcelado_${parcela.nome || pIdx}`;
              const percentMasked = maskPercentBRLInput(
                Math.round(Number(parcela.percent) * 100).toString()
              );
              const valueMasked = maskValueBRLInput(parcela.value);
              return (
                <tr key={parcelaKey}>
                  <td style={{ width: 56, textAlign: "center" }}>
                    <ToggleComponent
                      checked={!!ativos[parcelaKey]}
                      onChange={() => onToggle(parcelaKey)}
                    />
                  </td>
                  <td style={{ color: "#fff", fontWeight: 500 }}>
                    Crédito Parcelado {parcela.nome ? `(${parcela.nome})` : ""}
                  </td>
                  <td style={{ width: 90, textAlign: "right" }}>
                    <span
                      style={{
                        color: purple,
                        fontWeight: 700,
                        minWidth: 60
                      }}
                    >
                      {percentMasked} %
                    </span>
                  </td>
                  <td style={{ width: 120, textAlign: "right" }}>
                    <span
                      style={{
                        color: purple,
                        fontWeight: 700,
                        minWidth: 60
                      }}
                    >
                      R$ {valueMasked}
                    </span>
                  </td>
                </tr>
              );
            });
            // Retorna a linha principal seguida das linhas das parcelas
            return [mainRow, ...parcelasRows];
          }
          // Retorna só a linha principal
          return [mainRow];
        })}

        {/* Outros encargos (customizados pelo usuário) */}
        {outrosEncargos.map(item => {
          const key = item.id ?? item.nome;
          const percent = item.percent ?? 0;
          const value = item.value ?? 0;
          const percentMasked = maskPercentBRLInput(
            Math.round(Number(percent) * 100).toString()
          );
          const valueMasked = maskValueBRLInput(value);

          return (
            <tr key={key}>
              <td style={{ width: 56, textAlign: "center" }}>
                <ToggleComponent
                  checked={!!ativos[key]}
                  onChange={() => onToggle(key)}
                />
              </td>
              <td style={{ color: "#fff", fontWeight: 500 }}>{item.nome}</td>
              <td style={{ width: 90, textAlign: "right" }}>
                <span
                  style={{
                    color: purple,
                    fontWeight: 700,
                    minWidth: 60
                  }}
                >
                  {percentMasked} %
                </span>
              </td>
              <td style={{ width: 120, textAlign: "right" }}>
                <span
                  style={{
                    color: purple,
                    fontWeight: 700,
                    minWidth: 60
                  }}
                >
                  R$ {valueMasked}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}