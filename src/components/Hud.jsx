import Icon from "./Icon.jsx";
export default function Hud({ game, onSettings, onEnergy }) {
  const festivalNight =
    game.milestones.festival && game.day === game.festivalDay;
  return (
    <header className="hud">
      <div className="hud-top">
        <div className="valley-name">
          <span>GREEN VALLEY</span>
          <h1>{festivalNight ? "Đêm hội mùa xanh" : "Nông trại của bạn"}</h1>
        </div>
        <button
          className="icon-button settings-button"
          aria-label="Cài đặt"
          onClick={onSettings}
        >
          <Icon name="settings" size={21} />
        </button>
      </div>
      <div className="resources">
        <div
          className="level-token"
          aria-label={`Cấp ${game.level}, ${game.xp} trên 100 kinh nghiệm`}
        >
          <Icon name="star" size={33} />
          <b>{game.level}</b>
        </div>
        <span className="resource coins">
          <Icon name="coin" size={23} />
          <b>{game.coins.toLocaleString("vi-VN")}</b>
          <span className="sr-only">xu</span>
        </span>
        <span className="resource gems">
          <Icon name="gem" size={21} />
          <b>{game.gems}</b>
          <span className="sr-only">ngọc</span>
        </span>
        <button
          className={`resource energy ${!game.energy ? "depleted" : ""}`}
          onClick={onEnergy}
          aria-label={`Năng lượng ${game.energy}/5. Nghỉ sang ngày mới`}
        >
          <Icon name="energy" size={23} />
          <b>
            {game.energy}
            <small>/5</small>
          </b>
          <span className="resource-plus">+</span>
        </button>
      </div>
      <div className="day-line">
        <span>
          <Icon
            name={festivalNight ? "moon" : game.day % 3 === 0 ? "water" : "sun"}
            size={16}
          />
          Ngày {game.day} ·{" "}
          {festivalNight
            ? "Đêm hội"
            : game.day % 3 === 0
              ? "Mưa xuân"
              : "Nắng dịu"}
        </span>
        <div
          className="xp-track"
          role="progressbar"
          aria-label="Kinh nghiệm cấp độ"
          aria-valuenow={game.xp}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${game.xp}%` }} />
        </div>
        <span>{game.xp}/100</span>
      </div>
    </header>
  );
}
