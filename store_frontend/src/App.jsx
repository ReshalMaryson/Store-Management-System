import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import Cashier from "./components/cashier";
import Navbar from "./components/navbar";
import PrintInvoice from "./components/helplers_cashier/printable_Invoice";
import "./JS/configchart";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/user/cashier" element={<Cashier />} />
        <Route
          path="/invoice/print/:billID/:staffRole/:staffName"
          element={<PrintInvoice />}
        />
      </Routes>
    </>
  );
}

export default App;
