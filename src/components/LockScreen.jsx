export default function LockScreen({ title, subtitle, password, setPassword, onUnlock }) {
  return (
    <div className="lock">
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>

      <input
        type="password"
        placeholder="Введите пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="green" style={{ marginTop: 12 }} onClick={onUnlock}>
        Войти
      </button>
    </div>
  );
}