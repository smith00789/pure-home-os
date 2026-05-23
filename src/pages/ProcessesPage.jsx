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

const taskStatuses = [
  "Новая",
  "Назначена",
  "Ознакомился",
  "В пути",
  "У клиента",
  "Выполняется",
  "Завершена",
  "Проблема",
];

const taskTypes = ["Продажа", "Сервис", "Монтаж", "Диагностика", "Доставка"];

const defaultEmployees = [
  { id: "master1", name: "Сардор", phone: "77000000001", status: "free" },
  { id: "master2", name: "Ахмед", phone: "77012594204", status: "free" },
  { id: "master3", name: "Мастер 3", phone: "87021668728", status: "free" },
];

const emptyTask = {
  clientName: "",
  clientPhone: "",
  address: "",
  product: "",
  type: "Продажа",
  employeeId: "",
  time: "",
  comment: "",
  report: "",
  status: "Новая",
};

export default function ProcessesPage() {
  const [employees, setEmployees] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("ph_employees")) || defaultEmployees
    );
  });

  const [tasks, setTasks] = useState(() => {
    return JSON.parse(localStorage.getItem("ph_tasks")) || [];
  });

  const [form, setForm] = useState(emptyTask);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");

  useEffect(() => {
    localStorage.setItem("ph_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("ph_tasks", JSON.stringify(tasks));
  }, [tasks]);

  function cleanPhone(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function getEmployee(id) {
    return employees.find((employee) => employee.id === id);
  }

  function updateEmployeeStatus(employeeId, status) {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === employeeId
          ? { ...employee, status }
          : employee
      )
    );
  }

  function addTask(e) {
    e.preventDefault();

    if (!form.clientName || !form.clientPhone || !form.address || !form.employeeId) {
      alert("Заполните клиента, телефон, адрес и сотрудника");
      return;
    }

    const newTask = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toLocaleString("ru-RU"),
      status: "Назначена",
    };

    setTasks([newTask, ...tasks]);
    updateEmployeeStatus(form.employeeId, "assigned");
    setForm(emptyTask);
  }

  function changeTaskStatus(taskId, status) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        const map = {
          Ознакомился: "seen",
          "В пути": "onway",
          "У клиента": "atclient",
          Выполняется: "working",
          Завершена: "done",
          Проблема: "problem",
        };

        if (map[status]) {
          updateEmployeeStatus(task.employeeId, map[status]);
        }

        if (status === "Завершена") {
          setTimeout(() => {
            updateEmployeeStatus(task.employeeId, "free");
          }, 500);
        }

        return { ...task, status };
      })
    );
  }

  function updateReport(taskId, report) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, report } : task
      )
    );
  }

  function deleteTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (confirm("Удалить задание?")) {
      setTasks(tasks.filter((item) => item.id !== id));

      if (task?.employeeId) {
        updateEmployeeStatus(task.employeeId, "free");
      }
    }
  }

  function sendWhatsAppTask(task) {
    const employee = getEmployee(task.employeeId);

    if (!employee) {
      alert("Сотрудник не найден");
      return;
    }

    const text = `📍 НОВОЕ ЗАДАНИЕ PURE-HOME OS

Клиент: ${task.clientName}
Телефон: ${task.clientPhone}
Адрес: ${task.address}

Тип задания: ${task.type}
Товар / услуга: ${task.product || "Не указано"}
Время: ${task.time || "Не указано"}

Комментарий:
${task.comment || "Без комментария"}

Что нужно сделать:
1. Ознакомиться с заданием
2. Выехать к клиенту
3. Отметить: У клиента
4. После выполнения написать отчёт

PURE-HOME OS`;

    window.open(
      `https://wa.me/${cleanPhone(employee.phone)}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text =
        `${task.clientName} ${task.clientPhone} ${task.address} ${task.product} ${task.type} ${task.status}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchFilter = filter === "Все" || task.status === filter;

      return matchSearch && matchFilter;
    });
  }, [tasks, search, filter]);

  const stats = {
    all: tasks.length,
    active: tasks.filter(
      (task) => !["Завершена", "Проблема"].includes(task.status)
    ).length,
    done: tasks.filter((task) => task.status === "Завершена").length,
    free: employees.filter((employee) => employee.status === "free").length,
  };

  return (
    <>
      <div className="stats">
        <div className="stat">
          <span>Всего заданий</span>
          <h2>{stats.all}</h2>
        </div>

        <div className="stat">
          <span>Активные</span>
          <h2>{stats.active}</h2>
        </div>

        <div className="stat">
          <span>Завершены</span>
          <h2>{stats.done}</h2>
        </div>

        <div className="stat">
          <span>Свободные сотрудники</span>
          <h2>{stats.free}</h2>
        </div>
      </div>

      <section className="panel">
        <h2>Статус сотрудников</h2>

        {employees.map((employee) => (
          <div className="employee" key={employee.id}>
            <div className="employeeTop">
              <div>
                <b>{employee.name}</b>
                <div className="muted">{employee.phone}</div>
              </div>

              <span className={`badge ${employee.status}`}>
                {employeeStatuses[employee.status]}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2>Создать задание</h2>

        <form className="form" onSubmit={addTask}>
          <input
            placeholder="Клиент"
            value={form.clientName}
            onChange={(e) =>
              setForm({ ...form, clientName: e.target.value })
            }
          />

          <input
            placeholder="Телефон клиента"
            value={form.clientPhone}
            onChange={(e) =>
              setForm({ ...form, clientPhone: e.target.value })
            }
          />

          <input
            placeholder="Адрес"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            {taskTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <input
            placeholder="Товар / услуга"
            value={form.product}
            onChange={(e) =>
              setForm({ ...form, product: e.target.value })
            }
          />

          <input
            placeholder="Время"
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
          />

          <select
            value={form.employeeId}
            onChange={(e) =>
              setForm({ ...form, employeeId: e.target.value })
            }
          >
            <option value="">Выбрать сотрудника</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} — {employeeStatuses[employee.status]}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Чёткое указание сотруднику"
            value={form.comment}
            onChange={(e) =>
              setForm({ ...form, comment: e.target.value })
            }
          />

          <button className="green">Создать задание</button>
        </form>
      </section>

      <section className="panel">
        <h2>Задания</h2>

        <div className="toolbar">
          <input
            placeholder="Поиск по клиенту, адресу, товару..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Все</option>
            {taskStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        {filteredTasks.length === 0 && (
          <div className="muted" style={{ padding: 24, textAlign: "center" }}>
            Заданий пока нет
          </div>
        )}

        {filteredTasks.map((task) => {
          const employee = getEmployee(task.employeeId);

          return (
            <div className="task" key={task.id}>
              <div className="taskTop">
                <div>
                  <b>{task.clientName}</b>

                  <div className="meta">
                    📞 {task.clientPhone}
                    <br />
                    📍 {task.address}
                    <br />
                    🧾 {task.type} — {task.product || "—"}
                    <br />
                    👷 {employee?.name || "Не назначен"}
                    <br />
                    🕒 {task.time || "—"}
                    <br />
                    💬 {task.comment || "—"}
                  </div>
                </div>

                <span className="badge">{task.status}</span>
              </div>

              <div className="taskActions">
                <button
                  className="blue"
                  onClick={() => sendWhatsAppTask(task)}
                >
                  WhatsApp
                </button>

                <button
                  className="orange"
                  onClick={() =>
                    changeTaskStatus(task.id, "Ознакомился")
                  }
                >
                  Ознакомился
                </button>

                <button
                  className="cyan"
                  onClick={() => changeTaskStatus(task.id, "В пути")}
                >
                  Выехал
                </button>

                <button
                  className="green"
                  onClick={() =>
                    changeTaskStatus(task.id, "У клиента")
                  }
                >
                  У клиента
                </button>
              </div>

              <div className="taskActions2">
                <button
                  className="cyan"
                  onClick={() =>
                    changeTaskStatus(task.id, "Выполняется")
                  }
                >
                  Выполняет
                </button>

                <button
                  className="green"
                  onClick={() =>
                    changeTaskStatus(task.id, "Завершена")
                  }
                >
                  Завершил
                </button>

                <button
                  className="red"
                  onClick={() => changeTaskStatus(task.id, "Проблема")}
                >
                  Проблема
                </button>
              </div>

             <textarea
  style={{ marginTop: 12 }}
  placeholder="Отчёт сотрудника"
  value={task.report}
  onChange={(e) =>
    updateReport(task.id, e.target.value)
  }
/>

<div className="moneyGrid" style={{ marginTop: 12 }}>
  <div className="moneyBox">
    <span>Фото до</span>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          setTasks((prev) =>
            prev.map((item) =>
              item.id === task.id
                ? { ...item, photoBefore: reader.result }
                : item
            )
          );
        };
        reader.readAsDataURL(file);
      }}
    />

    {task.photoBefore && (
      <img
        src={task.photoBefore}
        alt="Фото до"
        style={{
          width: "100%",
          marginTop: 10,
          borderRadius: 12,
        }}
      />
    )}
  </div>

  <div className="moneyBox">
    <span>Фото после</span>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          setTasks((prev) =>
            prev.map((item) =>
              item.id === task.id
                ? { ...item, photoAfter: reader.result }
                : item
            )
          );
        };
        reader.readAsDataURL(file);
      }}
    />

    {task.photoAfter && (
      <img
        src={task.photoAfter}
        alt="Фото после"
        style={{
          width: "100%",
          marginTop: 10,
          borderRadius: 12,
        }}
      />
    )}
  </div>
</div>

              <button
                className="red"
                style={{ marginTop: 10 }}
                onClick={() => deleteTask(task.id)}
              >
                Удалить
              </button>
            </div>
          );
        })}
      </section>
    </>
  );
}