import React, { useState } from "react";
import {
  FaUser,
  FaCog,
  FaMoneyBill,
  FaPercent,
  FaBoxes,
  FaChartLine,
  FaPowerOff,
} from "react-icons/fa";
import { GiChefToque } from "react-icons/gi";
// Caminho relativo partindo de src/components para src/components/modals/ModalUpgradePlano
import ModalUpgradePlano from "./components/modals/ModalUpgradePlano";
import { useAuth } from "./App";
import "./SidebarMenu.css";

export default function SidebarMenu({
  selected,
  onSelect,
  onLogout,
  subCategoriasPrincipais = [],
  subCategoriasMarkup = [],
  sidebarExpanded,
  setSidebarExpanded,
}) {
  const [custosOpen, setCustosOpen] = useState(false);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [estoqueOpen, setEstoqueOpen] = useState(false);
  const [receitasOpen, setReceitasOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { user } = useAuth() || {};
  const plano = user?.plano || "gratuito";
  const isPlanoGratuito = plano === "gratuito";

  const menuItems = [
    { label: "Perfil", icon: <FaUser /> },
    { label: "Configurações", icon: <FaCog /> },
    {
      label: "Custos",
      icon: <FaMoneyBill />,
      subItems: subCategoriasPrincipais.map((cat) => ({
        label: cat.label,
      })),
    },
    {
      label: "Markup",
      icon: <FaPercent />,
      subItems: subCategoriasMarkup.map((cat) => ({
        label: cat.label,
      })),
    },
    {
      label: "Estoque",
      icon: <FaBoxes />,
      subItems: [
        { label: "Fornecedores" },
        { label: "Cadastros" },
        { label: "Entrada" },
        { label: "Saída" },
        { label: "Movimentações" },
      ],
    },
    {
      label: "Quadro de Receitas",
      icon: <GiChefToque size={22} />,
      subItems: [{ label: "Central de Receitas" }],
    },
    {
      label: "Planejamento de Vendas",
      icon: <FaChartLine />,
    },
  ];

  const bloqueadosEstoque = ["Fornecedores", "Entrada", "Saída", "Movimentações"];

  function handleMenuClick(item) {
    if (item.label === "Custos") {
      setCustosOpen((open) => !open);
      setMarkupOpen(false);
      setEstoqueOpen(false);
      setReceitasOpen(false);
    } else if (item.label === "Markup") {
      setMarkupOpen((open) => !open);
      setCustosOpen(false);
      setEstoqueOpen(false);
      setReceitasOpen(false);
    } else if (item.label === "Estoque") {
      setEstoqueOpen((open) => !open);
      setCustosOpen(false);
      setMarkupOpen(false);
      setReceitasOpen(false);
    } else if (item.label === "Quadro de Receitas") {
      setReceitasOpen((open) => !open);
      setCustosOpen(false);
      setMarkupOpen(false);
      setEstoqueOpen(false);
    } else {
      onSelect(item.label);
      setCustosOpen(false);
      setMarkupOpen(false);
      setEstoqueOpen(false);
      setReceitasOpen(false);
    }
  }

  function handleSubItemClick(parentLabel, subItem) {
    if (
      parentLabel === "Estoque" &&
      isPlanoGratuito &&
      bloqueadosEstoque.includes(subItem.label)
    ) {
      setShowUpgradeModal(true);
      return;
    }
    onSelect(`${parentLabel}:${subItem.label}`);
  }

  // --- FUNÇÃO PARA IR PARA PLANOS DO PERFIL (SPA) ---
  function irParaPlanosPerfil() {
    console.log(">> Chamou irParaPlanosPerfil!");
    onSelect("Perfil:Planos");
    setShowUpgradeModal(false);
  }

  return (
    <>
      <nav
        className={`sidebar${sidebarExpanded ? " expanded" : ""}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => {
          setSidebarExpanded(false);
          setCustosOpen(false);
          setMarkupOpen(false);
          setEstoqueOpen(false);
          setReceitasOpen(false);
        }}
      >
        <div className="sidebar-logo" />
        <ul className="sidebar-list">
          {menuItems.map((item) => (
            <li key={item.label}>
              <div
                className={
                  "sidebar-list-item"
                  + (selected && (selected === item.label || (item.subItems && selected.startsWith(item.label + ":"))) ? " selected" : "")
                  + (item.subItems ? " has-submenu" : "")
                }
                onClick={() => handleMenuClick(item)}
                tabIndex={0}
                style={item.subItems ? { cursor: "pointer" } : {}}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">
                  <span className="label-text">{item.label}</span>
                  {item.label === "Custos" && item.subItems && (
                    <span
                      className="submenu-arrow"
                      style={{
                        transition: "transform 0.2s",
                        display: "inline-block",
                        transform: custosOpen ? "rotate(180deg)" : "rotate(0deg)",
                        marginLeft: 22,
                        verticalAlign: "middle",
                      }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <polygon points="12,17 6,10 18,10" fill="#b388ff" />
                      </svg>
                    </span>
                  )}
                  {item.label === "Markup" && item.subItems && (
                    <span
                      className="submenu-arrow"
                      style={{
                        transition: "transform 0.2s",
                        display: "inline-block",
                        transform: markupOpen ? "rotate(180deg)" : "rotate(0deg)",
                        marginLeft: 22,
                        verticalAlign: "middle",
                      }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <polygon points="12,17 6,10 18,10" fill="#b388ff" />
                      </svg>
                    </span>
                  )}
                  {item.label === "Estoque" && item.subItems && (
                    <span
                      className="submenu-arrow"
                      style={{
                        transition: "transform 0.2s",
                        display: "inline-block",
                        transform: estoqueOpen ? "rotate(180deg)" : "rotate(0deg)",
                        marginLeft: 22,
                        verticalAlign: "middle",
                      }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <polygon points="12,17 6,10 18,10" fill="#b388ff" />
                      </svg>
                    </span>
                  )}
                  {item.label === "Quadro de Receitas" && item.subItems && (
                    <span
                      className="submenu-arrow"
                      style={{
                        transition: "transform 0.2s",
                        display: "inline-block",
                        transform: receitasOpen ? "rotate(180deg)" : "rotate(0deg)",
                        marginLeft: 22,
                        verticalAlign: "middle",
                      }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <polygon points="12,17 6,10 18,10" fill="#b388ff" />
                      </svg>
                    </span>
                  )}
                </span>
              </div>

              {/* SUBMENUS */}
              {item.label === "Custos" && item.subItems && custosOpen && (
                <ul className="sidebar-submenu">
                  {item.subItems.map((sub) => (
                    <li
                      key={sub.label}
                      className={
                        "sidebar-subitem"
                        + (selected === `Custos:${sub.label}` ? " selected" : "")
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubItemClick("Custos", sub);
                      }}
                      tabIndex={0}
                    >
                      <span className="label-text">{sub.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {item.label === "Markup" && item.subItems && markupOpen && (
                <ul className="sidebar-submenu">
                  {item.subItems.map((sub) => (
                    <li
                      key={sub.label}
                      className={
                        "sidebar-subitem"
                        + (selected === `Markup:${sub.label}` ? " selected" : "")
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubItemClick("Markup", sub);
                      }}
                      tabIndex={0}
                    >
                      <span className="label-text">{sub.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {item.label === "Estoque" && item.subItems && estoqueOpen && (
                <ul className="sidebar-submenu">
                  {item.subItems.map((sub) => (
                    <li
                      key={sub.label}
                      className={
                        "sidebar-subitem"
                        + (selected === `Estoque:${sub.label}` ? " selected" : "")
                        + (isPlanoGratuito && bloqueadosEstoque.includes(sub.label) ? " locked" : "")
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubItemClick("Estoque", sub);
                      }}
                      tabIndex={0}
                      style={
                        isPlanoGratuito && bloqueadosEstoque.includes(sub.label)
                          ? { opacity: 0.55, cursor: "not-allowed" }
                          : {}
                      }
                    >
                      <span className="label-text">{sub.label}</span>
                      {isPlanoGratuito && bloqueadosEstoque.includes(sub.label) && (
                        <span
                          style={{
                            color: "#fdab00",
                            marginLeft: 10,
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          🔒
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {item.label === "Quadro de Receitas" && item.subItems && receitasOpen && (
                <ul className="sidebar-submenu">
                  {item.subItems.map((sub) => (
                    <li
                      key={sub.label}
                      className={
                        "sidebar-subitem"
                        + (selected === `Quadro de Receitas:${sub.label}` ? " selected" : "")
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubItemClick("Quadro de Receitas", sub);
                      }}
                      tabIndex={0}
                    >
                      <span className="label-text">{sub.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <hr className="sidebar-divider" />
        <div className="sidebar-list-item logout" onClick={onLogout} tabIndex={0}>
          <span className="icon">
            <FaPowerOff />
          </span>
          <span className="label">
            <span className="label-text">Sair</span>
          </span>
        </div>
      </nav>
      <ModalUpgradePlano
  open={showUpgradeModal}
  onClose={() => {
    setShowUpgradeModal(false);
    onSelect("Perfil"); // Redireciona para a aba Perfil ao fechar
  }}
  irParaPlanos={irParaPlanosPerfil}
/>

    </>
  );
}
