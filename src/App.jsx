import { useState, useEffect } from "react";
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

import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);

  // Логин форма
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError("Неверный email или пароль");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function goToProcess(client) {
    setSelectedClient(client);
    setSection("processes");
  }

  function goToOwner(client) {
    setSelectedClient(client);
    setSection("owner");
  }

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="auth-box">
          <h2>PURE-HOME OS</h2>
          <p className="muted">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Экран логина
  if (!session) {
    return (
      <div className="auth-screen">
        <div className="auth-box">
          <h1>PURE<span style={{ color: "#22c55e" }}>HOME</span></h1>
          <p className="muted">Business Operating System</p>

          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authError && (
              <p style={{ color: "#ef4444", fontSize: "14px" }}>{authError}</p>
            )}
            <button type="submit" className="btn-login">
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Основное приложение
  return (
    <div className="app">
      <Sidebar section={section} setSection={setSection} />

      <main className="main">
        <div className="top">
          <div>
            <h1>PURE-HOME OS</h1>
            <div className="muted">Единая система управления бизнесом</div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Выйти
          </button>
        </div>

        {section === "clients" && (
          <ClientsPage
            onCreateTask={goToProcess}
            onCreateDeal={goToOwner}
          />
        )}
        {section === "objects" && <ObjectsPage />}
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
      </main>
    </div>
  );
}
