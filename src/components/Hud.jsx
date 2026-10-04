import Icon from "./Icon.jsx";
export default function Hud({ game, onSettings, onEnergy }) {
  return (
    <header className="hud">
      <div className="brand-row">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="leaf" size={23} />
          </span>
          <div>
            <h1>Green Valley</h1>
            <span>một mùa mới, một khởi đầu</span>
          </div>
        </div>
        <button
          className="icon-button"
          aria-label="Cài đặt"
          onClick={onSettings}
        >
          <Icon name="settings" />
        </button>
      </div>
      <div className="resources">
        <span className="resource coins">
          <Icon name="coin" />
          <b>{game.coins.toLocaleString("vi-VN")}</b>
          <span className="sr-only">xu</span>
        </span>
        <span className="resource gems">
          <Icon name="gem" />
          <b>{game.gems}</b>
          <span className="sr-only">ngọc</span>
        </span>
        <button
          className={`resource energy ${!game.energy ? "depleted" : ""}`}
          onClick={onEnergy}
          aria-label={`Năng lượng ${game.energy}/5. Nghỉ sang ngày mới`}
        >
          <Icon name="energy" />
          <b>
            {game.energy}
            <small>/5</small>
          </b>
          <span className="resource-plus">+</span>
        </button>
      </div>
      <div className="level-row">
        <span className="level-badge">{game.level}</span>
        <span className="level-label">Người gieo mùa</span>
        <div
          className="xp-track"
          role="progressbar"
          aria-label="Kinh nghiệm cấp độ"
          aria-valuenow={game.xp}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${game.xp}%` }} />
        </div>
        <span className="xp-value">{game.xp}/100</span>
      </div>
    </header>
  );
}
