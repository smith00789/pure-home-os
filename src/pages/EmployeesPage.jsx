import { useEffect, useMemo, useState } from "react";

const employeeStatuses = {
  free: "Свободен",
  assigned: "Назначена задача",
  seen: "Ознакомился",
  onway: "В пути",
  atclient: "У клиента",
  working: "Выполняет",
  done: "Завершил",
  problem: "Проблема",
};

const emptyEmployee = {
  name: "",
  phone: "",
  role: "Мастер",
  status: "free",
  comment: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_employees")) || [
      { id: "master1", name: "Сардор", phone: "77000000001", role: "Мастер", status: "free", comment: "" },
      { id: "master2", name: "Ахмед", phone: "77012594204", role: "Мастер", status: "free", comment: "" },
      { id: "master3", name: "Мастер 3", phone: "87021668728", role: "Мастер", status: "free", comment: "" },
    ];
  });

  const [form, setForm] = useState(emptyEmployee);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("ph_employees", JSON.stringify(employees));
  }, [employees]);

  function cleanPhone(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function saveEmployee(e) {
    e.preventDefault();

    if (!form.name || !form.phone) {
      alert("Введите имя и телефон сотрудника");
      return;
    }

    const employeeData = {
      ...form,
      phone: cleanPhone(form.phone),
    };

    if (editingId) {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editingId ? { ...employee, ...employeeData } : employee
        )
      );
      setEditingId(null);
    } else {
      setEmployees([
        {
          id: "emp_" + Date.now(),
          ...employeeData,
          createdAt: new Date().toLocaleDateString("ru-RU"),
        },
        ...employees,
      ]);
    }

    setForm(emptyEmployee);
  }

  function editEmployee(employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name || "",
      phone: employee.phone || "",
      role: employee.role || "Мастер",
      status: employee.status || "free",
      comment: employee.comment || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteEmployee(id) {
    if (confirm("Удалить сотрудника?")) {
      setEmployees(employees.filter((employee) => employee.id !== id));
    }
  }

  function openWhatsApp(phone) {
    window.open(`https://wa.me/${cleanPhone(phone)}`, "_blank");
  }

  function updateStatus(id, status) {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id ? { ...employee, status } : employee
      )
    );
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const text = `${employee.name} ${employee.phone} ${employee.role} ${employee.comment}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [employees, search]);

  const stats = {
    all: employees.length,
    free: employees.filter((e) => e.status === "free").length,
    busy: employees.filter((e) => !["free", "done"].includes(e.status)).length,
    problem: employees.filter((e) => e.status === "problem").length,
  };

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Всего сотрудников</span>
          <h2>{stats.all}</h2>
        </div>

        <div className="stat">
          <span>Свободны</span>
          <h2 className="greenText">{stats.free}</h2>
        </div>

        <div className="stat">
          <span>Заняты</span>
          <h2>{stats.busy}</h2>
        </div>

        <div className="stat">
          <span>Проблема</span>
          <h2 className="redText">{stats.problem}</h2>
        </div>
      </div>

      <section className="panel">
        <h2>{editingId ? "Редактировать сотрудника" : "Добавить сотрудника"}</h2>

        <form className="form" onSubmit={saveEmployee}>
          <input
            placeholder="Имя сотрудника"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="WhatsApp номер"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option>Мастер</option>
            <option>Оператор</option>
            <option>Менеджер</option>
            <option>Бухгалтер</option>
            <option>Курьер</option>
          </select>

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {Object.entries(employeeStatuses).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Комментарий по сотруднику"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />

          <button className="green">
            {editingId ? "Сохранить сотрудника" : "Добавить сотрудника"}
          </button>

          {editingId && (
            <button
              type="button"
              className="orange"
              onClick={() => {
                setEditingId(null);
                setForm(emptyEmployee);
              }}
            >
              Отмена
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <h2>Сотрудники</h2>

        <input
          placeholder="Поиск сотрудника..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {filteredEmployees.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            Сотрудников пока нет
          </div>
        )}

        {filteredEmployees.map((employee) => (
          <div className="employee" key={employee.id}>
            <div className="employeeTop">
              <div>
                <b>{employee.name}</b>

                <div className="meta">
                  📞 {employee.phone}
                  <br />
                  Роль: {employee.role || "Мастер"}
                  <br />
                  💬 {employee.comment || "—"}
                </div>
              </div>

              <select
                value={employee.status}
                onChange={(e) => updateStatus(employee.id, e.target.value)}
                style={{ maxWidth: 230 }}
              >
                {Object.entries(employeeStatuses).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="clientActions">
              <button className="blue" onClick={() => openWhatsApp(employee.phone)}>
                WhatsApp
              </button>

              <button className="orange" onClick={() => editEmployee(employee)}>
                Редактировать
              </button>

              <button className="red" onClick={() => deleteEmployee(employee.id)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}