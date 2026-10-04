import { MISSIONS } from "../data/missions.js";
import { missionIndex } from "../game/engine.js";
import Icon from "../components/Icon.jsx";
export default function StoryScreen({ game, onOpen }) {
  const index = missionIndex(game);
  return (
    <section className="screen content-screen journal-screen">
      <div className="journal-cover">
        <img src="./farm-diorama.png" alt="Nông trại thu nhỏ giữa thung lũng" />
        <div>
          <p className="eyebrow">Nhật ký thung lũng</p>
          <h2>Ngày trở về</h2>
          <p>Chương 1 · {Math.min(index, 6)}/6 kỷ niệm</p>
        </div>
      </div>
      <p className="screen-intro">
        “Chăm đất bằng sự kiên nhẫn, và đất sẽ trả lại con những mùa xanh.” —
        Ông nội
      </p>
      <ol className="mission-list">
        {MISSIONS.map((m, i) => (
          <li
            key={m.flag}
            className={i < index ? "finished" : i === index ? "current" : ""}
          >
            <span className="journal-number">
              {i < index ? <Icon name="check" size={18} /> : i + 1}
            </span>
            <div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              {i === index && (
                <button
                  className="text-button"
                  onClick={() => onOpen(m.target)}
                >
                  {m.action}
                  <Icon name="arrow" size={16} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {game.milestones.market && (
        <div className="story-letter">
          <p className="eyebrow">Chương 2 đã mở</p>
          <h3>Một mái nhà ấm</h3>
          <p>
            Tu sửa mái nhà, mở thêm luống rau và tìm cuốn nhật ký ông để lại.
          </p>
          <button className="primary-button" onClick={() => onOpen("house")}>
            Trở về nhà
            <Icon name="home" size={18} />
          </button>
        </div>
      )}
      <details className="daily-log">
        <summary>Những việc bạn đã làm</summary>
        <ul>
          {game.logs.map((log, i) => (
            <li key={`${i}-${log}`}>{log}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
