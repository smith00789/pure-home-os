import { useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";

import ClientsPage from "./pages/ClientsPage";
import ProcessesPage from "./pages/ProcessesPage";
import EmployeesPage from "./pages/EmployeesPage";
import OwnerPage from "./pages/OwnerPage";
import AccountingPage from "./pages/AccountingPage";
import ExpensesPage from "./pages/ExpensesPage";
import WarehousePage from "./pages/WarehousePage";
import ObjectsPage from "./pages/ObjectsPage";

export default function App() {
  const [section, setSection] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);

  function goToProcess(client) {
    setSelectedClient(client);
    setSection("processes");
  }

  function goToOwner(client) {
    setSelectedClient(client);
    setSection("owner");
  }

  return (
    <div className="app">
      <Sidebar section={section} setSection={setSection} />

      <main className="main">
        <div className="top">
          <div>
            <h1>PURE-HOME OS</h1>
            <div className="muted">
              Единая система управления бизнесом
            </div>
          </div>
        </div>

        {section === "clients" && (
          <ClientsPage
            onCreateTask={goToProcess}
            onCreateDeal={goToOwner}
          />
        )}

        {section === "processes" && (
          <ProcessesPage selectedClient={selectedClient} />
        )}

        {section === "employees" && <EmployeesPage />}

        {section === "owner" && (
          <OwnerPage selectedClient={selectedClient} />
        )}

        {section === "accounting" && <AccountingPage />}
        {section === "expenses" && <ExpensesPage />}
        {section === "warehouse" && <WarehousePage />}
        {section === "clients" && <ClientsPage />}
      </main>
    </div>
  );
}