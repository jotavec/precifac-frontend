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
  const CHAVES = [
    { key: "icms", label: "ICMS" },
    { key: "iss", label: "ISS" },
    { key: "pisCofins", label: "PIS/COFINS" },
    { key: "irpjCsll", label: "IRPJ/CSLL" },
    { key: "ipi", label: "IPI" },
    { key: "debito", label: "Taxa Débito" },
    { key: "credito", label: "Taxa Crédito" },
    { key: "boleto", label: "Taxa Boleto" },
    { key: "pix", label: "Taxa Pix" },
    { key: "gateway", label: "Taxa Gateway" },
    { key: "marketing", label: "Comissão Marketing" },
    { key: "delivery", label: "Comissão Delivery" },
    { key: "saas", label: "Comissão SaaS" },
    { key: "colaboradores", label: "Comissão Colaboradores" }
  ];

  const azul = "#2196f3";
  const cinza = "#97a7c3";
  const parcelas = Array.isArray(encargosData.creditoParcelado)
    ? encargosData.creditoParcelado
    : [];

  const renderLinha = (key, label, percent, value) => {
    const percentMasked = maskPercentBRLInput(Math.round(Number(percent) * 100).toString());
    const valueMasked = maskValueBRLInput(value);
    return (
      <tr key={key}>
        <td style={{ width: 56, textAlign: "center" }}>
          <ToggleComponent checked={!!ativos[key]} onChange={() => onToggle(key)} />
        </td>
        <td style={{ color: azul, fontWeight: 700 }}>{label}</td>
        <td style={{ width: 90, textAlign: "right" }}>
          <span style={{
            color: azul,
            fontWeight: 900,
            minWidth: 60
          }}>
            {percentMasked} %
          </span>
        </td>
        <td style={{ width: 120, textAlign: "right" }}>
          <span style={{
            color: azul,
            fontWeight: 900,
            minWidth: 60
          }}>
            R$ {valueMasked}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <table className="markup-ideal-table" style={{ width: "100%" }}>
      <tbody>
        {/* IMPOSTOS */}
        <tr>
          <td colSpan={4} style={{
            color: cinza,
            fontWeight: 800,
            fontSize: "1.07rem",
            padding: "10px 0 4px"
          }}>
            Impostos
          </td>
        </tr>
        {["icms", "iss", "pisCofins", "irpjCsll", "ipi"].map(key =>
          renderLinha(key, CHAVES.find(c => c.key === key)?.label, encargosData[key]?.percent ?? 0, encargosData[key]?.value ?? 0)
        )}

        {/* TAXAS */}
        <tr>
          <td colSpan={4} style={{
            color: cinza,
            fontWeight: 800,
            fontSize: "1.07rem",
            padding: "16px 0 4px"
          }}>
            Taxas de Meios de Pagamento
          </td>
        </tr>
        {["debito", "credito", "boleto", "pix", "gateway"].flatMap(key => {
          const linhas = [
            renderLinha(key, CHAVES.find(c => c.key === key)?.label, encargosData[key]?.percent ?? 0, encargosData[key]?.value ?? 0)
          ];
          if (key === "credito" && parcelas.length > 0) {
            parcelas.forEach((parcela, pIdx) => {
              const parcelaKey = `creditoParcelado_${parcela.nome || pIdx}`;
              linhas.push(renderLinha(
                parcelaKey,
                `Crédito Parcelado ${parcela.nome ? `(${parcela.nome})` : ""}`,
                parcela.percent,
                parcela.value
              ));
            });
          }
          return linhas;
        })}

        {/* COMISSÕES */}
        <tr>
          <td colSpan={4} style={{
            color: cinza,
            fontWeight: 800,
            fontSize: "1.07rem",
            padding: "16px 0 4px"
          }}>
            Comissões e Plataformas
          </td>
        </tr>
        {["marketing", "delivery", "saas", "colaboradores"].map(key =>
          renderLinha(key, CHAVES.find(c => c.key === key)?.label, encargosData[key]?.percent ?? 0, encargosData[key]?.value ?? 0)
        )}

        {/* OUTROS */}
        {outrosEncargos.length > 0 && (
          <>
            <tr>
              <td colSpan={4} style={{
                color: cinza,
                fontWeight: 800,
                fontSize: "1.07rem",
                padding: "16px 0 4px"
              }}>
                Outros Encargos
              </td>
            </tr>
            {outrosEncargos.map(item =>
              renderLinha(item.id ?? item.nome, item.nome, item.percent, item.value)
            )}
          </>
        )}
      </tbody>
    </table>
  );
}
