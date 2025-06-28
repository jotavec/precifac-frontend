import { FaCheck, FaTimes } from "react-icons/fa";

export default function TesteIcones() {
  return (
    <div style={{ fontSize: 48, color: 'lime' }}>
      <FaCheck /> <FaTimes />
    </div>
  );
}
function App() {
  return (
    <div>
      <TesteIcones />
      {/* ...restante da sua app */}
    </div>
  );
}
