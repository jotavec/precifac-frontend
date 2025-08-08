import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const BOX_SIZE = 300;
const TEMPO_UNIDADE_TXT = ["dias", "meses", "anos"];

const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 12,
    backgroundColor: "#fff"
  },
  titulo: {
    fontSize: 24,
    color: "#222",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 32,
    marginBottom: 10,
  },
  imgBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: '#ededed',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#d3d3d3',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 0,
    flexShrink: 0,
  },
  receitaImg: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 18,
    objectFit: 'cover',
    backgroundColor: '#ededed',
  },
  quadro: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 2,
    borderColor: '#d3d3d3',
    borderRadius: 18,
    backgroundColor: '#f7fafd',
    padding: 18,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexShrink: 0,
  },
  tituloSecao: {
    fontSize: 16,
    color: '#222',
    fontWeight: 900,
    marginBottom: 6,
  },
  tabelaHeader: {
    flexDirection: 'row',
    backgroundColor: '#eaf6ff',
    borderRadius: 7,
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 3,
    color: '#222',
  },
  tabelaCellHeader: {
    flex: 1,
    padding: 4,
    textAlign: 'center',
  },
  tabelaCellHeaderLeft: {
    flex: 1.5,
    padding: 4,
    textAlign: 'left',
  },
  linha: {
    flexDirection: 'row',
    fontSize: 11,
    backgroundColor: '#fff',
    borderBottomWidth: 0.7,
    borderBottomColor: '#e8f3ff',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  cell: { flex: 1, textAlign: 'center', color: "#222", justifyContent: 'center' },
  cellLeft: { flex: 1.5, textAlign: 'left', color: "#222", fontWeight: 700, justifyContent: 'center' },
  dadosTitulo: {
    marginTop: 10,
    fontSize: 15,
    color: '#222',
    fontWeight: 900,
    marginBottom: 5,
  },
  tabelaHeader2: {
    flexDirection: 'row',
    backgroundColor: '#eaf6ff',
    borderRadius: 7,
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 3,
    color: '#222',
  },
  cellDesc: { flex: 1.5, textAlign: 'left', fontWeight: 700, color: '#222', justifyContent: 'center' },
  cellDados: { flex: 2, textAlign: 'left', color: '#222', fontWeight: 700, justifyContent: 'center' },
  linha2: {
    flexDirection: 'row',
    fontSize: 11.5,
    backgroundColor: '#fff',
    borderBottomWidth: 0.7,
    borderBottomColor: '#e8f3ff',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  cellDadosTxt: { flex: 2, textAlign: 'left', color: '#222', fontWeight: 700, justifyContent: 'center' },
  tabela: {
    width: "100%",
    marginTop: 12,
    borderStyle: "solid",
    borderColor: "#e8f3ff",
    borderWidth: 1,
    borderRadius: 7
  },
  thead: {
    flexDirection: "row",
    backgroundColor: "#f7fafd",
    color: "#222",
    fontWeight: "bold",
    fontSize: 13,
    paddingVertical: 2,
  },
  thItens: { flex: 1, padding: 6, fontWeight: "bold", textAlign: "center", fontSize: 12 },
  td: { flex: 1, padding: 6, fontSize: 11, textAlign: "center", color: "#222", justifyContent: 'center' },
  tdLeft: { textAlign: "left" },
  tr: { flexDirection: "row", backgroundColor: "#fff", alignItems: 'center' },
  trAlt: { flexDirection: "row", backgroundColor: "#fafdff", alignItems: 'center' },
  marcasLista: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 0,
    margin: 0,
    padding: 0,
    justifyContent: "center",
  },
  marcasItem: {
    fontSize: 11,
    color: "#222",
    padding: 0,
    margin: 0,
    lineHeight: 1.2,
    textAlign: "left",
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
  },
  marcasBolinha: {
    fontSize: 12,
    marginRight: 4,
    marginTop: 1,
    alignSelf: 'center',
  },
  blocoPreparo: {
    marginTop: 22,
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#f7fafd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 0,
  },
  preparoTitulo: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8
  },
  passoLinha: { flexDirection: "row", marginBottom: 14, alignItems: 'center' },
  passoNum: { fontWeight: "bold", color: "#222", marginRight: 8, fontSize: 11 },
  passoDesc: { color: "#222", fontSize: 11, flex: 1 },
  passoImg: { width: 40, height: 40, marginLeft: 8, borderRadius: 5, objectFit: "cover" },
  blocoObs: {
    marginTop: 30,
    backgroundColor: "#fff6e0",
    borderColor: "#ffe6aa",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 13,
    fontSize: 13,
    color: "#333",
    fontWeight: 600,
    whiteSpace: "pre-line",
    boxShadow: "0 2px 10px #f6cc6e1a",
    width: "100%",
    minHeight: 36,
  },
  obsTitulo: {
    fontWeight: 900,
    fontSize: 15,
    marginBottom: 6,
    color: "#b1850d",
    letterSpacing: 0.02,
  }
});

function MarcasPDF({ marca }) {
  if (!marca) return <Text style={pdfStyles.marcasItem}>-</Text>;
  let marcasArr = [];
  if (Array.isArray(marca)) {
    marcasArr = marca;
  } else if (typeof marca === "string" && marca.includes(",")) {
    marcasArr = marca.split(",").map(m => m.trim()).filter(Boolean);
  } else if (typeof marca === "string") {
    marcasArr = [marca];
  }
  if (marcasArr.length === 0) return <Text style={pdfStyles.marcasItem}>-</Text>;
  return (
    <View style={pdfStyles.marcasLista}>
      {marcasArr.map((m, i) => (
        <View key={i} style={pdfStyles.marcasItem}>
          <Text style={pdfStyles.marcasBolinha}>•</Text>
          <Text>{m}</Text>
        </View>
      ))}
    </View>
  );
}

function HeaderFichaPDF({
  nomeReceita, imagemFinal, conservacaoData, dataUltimaAtualizacao,
  rendimentoNumero, rendimentoUnidade, pesoUnitario, tipoSelecionado,
  tempoTotal, tempoUnidade
}) {
  const listaConservacao = Array.isArray(conservacaoData) && conservacaoData.length
    ? conservacaoData
    : [
      { descricao: "Congelado", temp: "-18", tempoNum: "6", tempoUnidade: "meses" },
      { descricao: "Refrigerado", temp: "4", tempoNum: "3", tempoUnidade: "dias" },
      { descricao: "Ambiente", temp: "20", tempoNum: "2", tempoUnidade: "anos" },
    ];
  const receitaImgUrl = imagemFinal
    ? (imagemFinal.startsWith("http")
      ? imagemFinal
      : (BACKEND_URL.replace(/\/$/, "") + "/" + imagemFinal.replace(/^\//, "")))
    : null;
  return (
    <View>
      <Text style={pdfStyles.titulo}>
        {nomeReceita || "Nome da Receita"}
      </Text>
      <View style={pdfStyles.headerMain}>
        <View style={pdfStyles.imgBox}>
          {receitaImgUrl && (
            <Image style={pdfStyles.receitaImg} src={receitaImgUrl} />
          )}
        </View>
        <View style={pdfStyles.quadro}>
          <Text style={pdfStyles.tituloSecao}>Conservação</Text>
          <View style={pdfStyles.tabelaHeader}>
            <Text style={pdfStyles.tabelaCellHeaderLeft}>Descrição</Text>
            <Text style={pdfStyles.tabelaCellHeader}>Temp. °C</Text>
            <Text style={pdfStyles.tabelaCellHeader}>Tempo</Text>
          </View>
          {listaConservacao.map((item, i) => (
            <View style={pdfStyles.linha} key={i}>
              <Text style={pdfStyles.cellLeft}>{item.descricao}</Text>
              <Text style={pdfStyles.cell}>{item.temp}°C</Text>
              <Text style={pdfStyles.cell}>
                {item.tempoNum} {typeof item.tempoUnidade === "number"
                  ? TEMPO_UNIDADE_TXT[item.tempoUnidade] || ""
                  : (item.tempoUnidade || "")}
              </Text>
            </View>
          ))}
          <Text style={pdfStyles.dadosTitulo}>Dados do produto</Text>
          <View style={pdfStyles.tabelaHeader2}>
            <Text style={pdfStyles.cellDesc}>Descrição</Text>
            <Text style={pdfStyles.cellDados}>Dados</Text>
          </View>
          <View style={pdfStyles.linha2}>
            <Text style={pdfStyles.cellDesc}>Atualização</Text>
            <Text style={pdfStyles.cellDadosTxt}>{dataUltimaAtualizacao || "-"}</Text>
          </View>
          <View style={pdfStyles.linha2}>
            <Text style={pdfStyles.cellDesc}>Rendimento</Text>
            <Text style={pdfStyles.cellDadosTxt}>{`${rendimentoNumero || "-"} ${rendimentoUnidade || ""}`}</Text>
          </View>
          <View style={pdfStyles.linha2}>
            <Text style={pdfStyles.cellDesc}>Peso (un)</Text>
            <Text style={pdfStyles.cellDadosTxt}>{pesoUnitario ? `${pesoUnitario} G` : "-"}</Text>
          </View>
          <View style={pdfStyles.linha2}>
            <Text style={pdfStyles.cellDesc}>Tipo</Text>
            <Text style={pdfStyles.cellDadosTxt}>{tipoSelecionado?.label || tipoSelecionado || "-"}</Text>
          </View>
          <View style={pdfStyles.linha2}>
            <Text style={pdfStyles.cellDesc}>Tempo total</Text>
            <Text style={pdfStyles.cellDadosTxt}>{tempoTotal ? `${tempoTotal} minutos` : "-"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function TableReceitasPDF({ header, rows, marcasColIndex = null }) {
  return (
    <View>
      <View style={pdfStyles.tabela}>
        <View style={pdfStyles.thead}>
          {header.map((h, idx) => (
            <Text key={idx} style={pdfStyles.thItens}>{h}</Text>
          ))}
        </View>
        {rows.map((row, idx) => (
          <View
            key={idx}
            style={idx % 2 ? pdfStyles.trAlt : pdfStyles.tr}
            wrap={false}
          >
            <Text style={[pdfStyles.td, pdfStyles.tdLeft]}>{row[0]}</Text>
            <View style={[pdfStyles.td, { justifyContent: 'center', alignItems: 'center', height: '100%' }]}>
              <MarcasPDF marca={row[1]} />
            </View>
            <Text style={pdfStyles.td}>{row[2]}</Text>
            <Text style={pdfStyles.td}>{row[3]}</Text>
            <Text style={pdfStyles.td}>{row[4]}</Text>
            <Text style={pdfStyles.td}>{row[5]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PreparoPDF({ passosPreparo = [] }) {
  if (!passosPreparo || passosPreparo.length === 0) return null;
  return (
    <View style={pdfStyles.blocoPreparo}>
      <Text style={pdfStyles.preparoTitulo}>Modo de Preparo</Text>
      {passosPreparo.map((passo, idx) => (
        <View style={pdfStyles.passoLinha} key={idx}>
          <Text style={pdfStyles.passoNum}>{`Passo ${idx + 1}:`}</Text>
          <Text style={pdfStyles.passoDesc}>{passo.descricao || "-"}</Text>
          {passo.imagem && (
            <Image src={passo.imagem} style={pdfStyles.passoImg} />
          )}
        </View>
      ))}
    </View>
  );
}

function ObservacoesPDF({ observacoes }) {
  if (!observacoes || !observacoes.trim()) return null;
  return (
    <View style={pdfStyles.blocoObs}>
      <Text style={pdfStyles.obsTitulo}>Observações</Text>
      <Text>{observacoes.trim()}</Text>
    </View>
  );
}

// ======= SUPORTA VARIAS RECEITAS ======= //
export default function FichaTecnicaPDF(props) {
  // Se receber um array de receitas, gera uma página para cada
  const { receitas, perfil } = props;

  // Função que gera o conteúdo de 1 ficha técnica
  function FichaTecnicaContent(receita, idx) {
    const {
      ingredientes = [],
      subReceitas = [],
      embalagens = [],
      passosPreparo = [],
      observacoes,
      ...rest
    } = receita;

    const ingredientesRows = ingredientes.map(item => {
      const qt1 = Number(item.qtUsada || item.quantidade || 0) || "-";
      return [
        item.nome || item.ingrediente || item.label || item.produtoId || "-",
        item.marca,
        item.unMedida || item.unidadeMedida || "-",
        qt1,
        qt1 !== "-" ? qt1 * 2 : "-",
        qt1 !== "-" ? qt1 * 3 : "-"
      ];
    });
    const subReceitasRows = subReceitas.map(item => {
      const qt1 = Number(item.qt || item.quantidade || 0) || "-";
      return [
        item.nome || item.receita || item.label || item.receitaId || "-",
        item.tipo || "-",
        item.medida || item.unidadeMedida || "-",
        qt1,
        qt1 !== "-" ? qt1 * 2 : "-",
        qt1 !== "-" ? qt1 * 3 : "-"
      ];
    });
    const embalagensRows = embalagens.map(item => {
      const qt1 = Number(item.qtUsada || item.quantidade || 0) || "-";
      return [
        item.nome || item.embalagem || item.label || item.produtoId || "-",
        item.marca,
        item.unMedida || item.unidadeMedida || "-",
        qt1,
        qt1 !== "-" ? qt1 * 2 : "-",
        qt1 !== "-" ? qt1 * 3 : "-"
      ];
    });

    return (
      <React.Fragment key={idx}>
        <HeaderFichaPDF {...rest} perfil={perfil} />
        {ingredientes && ingredientes.length > 0 &&
          <TableReceitasPDF
            header={["Ingredientes", "Marca", "Un. Medida", "1 Receita", "2 Receitas", "3 Receitas"]}
            rows={ingredientesRows}
            marcasColIndex={1}
          />
        }
        {subReceitas && subReceitas.length > 0 &&
          <TableReceitasPDF
            header={["Sub Receitas", "Tipo", "Un. Medida", "1 Receita", "2 Receitas", "3 Receitas"]}
            rows={subReceitasRows}
            marcasColIndex={null}
          />
        }
        {embalagens && embalagens.length > 0 &&
          <TableReceitasPDF
            header={["Embalagem", "Marca", "Un. Medida", "1 Receita", "2 Receitas", "3 Receitas"]}
            rows={embalagensRows}
            marcasColIndex={1}
          />
        }
        {passosPreparo && passosPreparo.length > 0 &&
          <PreparoPDF passosPreparo={passosPreparo} />
        }
        <ObservacoesPDF observacoes={observacoes} />

        {/* RODAPÉ HORIZONTAL - ALINHADO */}
        <View
          fixed
          style={{
            position: 'absolute',
            left: 32,
            right: 32,
            bottom: 2,
            height: 60,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          {/* NOME E CNPJ */}
          <View style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            fontSize: 10,
            color: '#b5b5b5',
            letterSpacing: 0.15,
            lineHeight: 1.35,
          }}>
            <Text>
              {perfil?.empresaNome || ""}
            </Text>
            <Text>
              {perfil?.cnpj || ""}
            </Text>
          </View>

          {/* LOGO DIREITA - MAIOR */}
          <Image
            src="/logo-calculaai.png"
            style={{
              width: 100,
              height: 38,
              opacity: 0.92,
              objectFit: 'contain',
              alignSelf: 'flex-end'
            }}
          />
        </View>
      </React.Fragment>
    );
  }

  // SE FOR ARRAY DE RECEITAS, LOTE (PDF com várias páginas)
  if (Array.isArray(receitas) && receitas.length > 0) {
  const receitasValidas = receitas.filter(r => r && typeof r === "object");
  if (receitasValidas.length === 0) {
    // Se nenhuma válida, gera página de erro simples:
    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <Text>Erro: Nenhuma receita válida para exportar.</Text>
        </Page>
      </Document>
    );
  }
  return (
    <Document>
      {receitasValidas.map((receita, idx) => (
        <Page key={idx} size="A4" style={pdfStyles.page}>
          {FichaTecnicaContent(receita, idx)}
        </Page>
      ))}
    </Document>
  );
}

  // SE NÃO, GERA UMA ÚNICA FICHA NORMAL
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {FichaTecnicaContent(props, 0)}
      </Page>
    </Document>
  );
}
