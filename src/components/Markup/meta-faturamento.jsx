import FaturamentoRealizado from "./FaturamentoRealizado";

export default function MetaFaturamento({ user }) {
  console.log("MetaFaturamento FOI CHAMADO", user);
  return (
    <div>
      <h2>Faturamento Realizado</h2>
      <FaturamentoRealizado user={user} />
    </div>
  );
}
