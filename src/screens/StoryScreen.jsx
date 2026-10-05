import { CHAPTERS, MISSIONS } from "../data/missions.js";
import { missionIndex } from "../game/engine.js";
import Icon from "../components/Icon.jsx";
export default function StoryScreen({ game, onOpen }) {
  const index = missionIndex(game);
  return (
    <section className="content-screen journal-screen">
      <div className="journal-cover">
        <img src="./art/valley-world.webp" alt="Khu vườn bên suối" />
        <div>
          <p className="eyebrow">NHẬT KÝ THUNG LŨNG</p>
          <h2>Một nơi để trở về</h2>
          <p>
            {index}/{MISSIONS.length} kỷ niệm đã viết
          </p>
        </div>
      </div>
      <p className="journal-intro">
        Ông để lại một khu vườn. Linh giữ lời hẹn mở lại phiên chợ. Còn bạn đang
        viết tiếp câu chuyện bằng từng mùa thu hoạch.
      </p>
      {CHAPTERS.map((ch) => (
        <section className="chapter-section" key={ch.id}>
          <header>
            <span>0{ch.id}</span>
            <div>
              <p className="eyebrow">Chương {ch.id}</p>
              <h3>{ch.title}</h3>
              <p>{ch.subtitle}</p>
            </div>
          </header>
          <ol className="mission-list">
            {MISSIONS.slice(ch.start, ch.end).map((m) => {
              const complete = game.milestones[m.flag],
                active = MISSIONS[index] === m;
              return (
                <li
                  key={m.flag}
                  className={complete ? "finished" : active ? "current" : ""}
                >
                  <span className="journal-number">
                    <Icon
                      name={complete ? "check" : active ? "leaf" : "lock"}
                      size={16}
                    />
                  </span>
                  <div>
                    <h4>{m.title}</h4>
                    <p>{m.desc}</p>
                    {active && (
                      <button
                        className="text-button"
                        onClick={() => onOpen(m.target)}
                      >
                        {m.action}
                        <Icon name="arrow" size={15} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      {game.milestones.festival && (
        <div className="story-letter">
          <p className="eyebrow">Lời cuối mùa</p>
          <h3>Thung lũng đã có cậu.</h3>
          <p>
            “Điều quý nhất không phải mùa bội thu, mà là những người cùng con
            chăm nó.”
          </p>
          <span>— Ông nội</span>
          <p>
            Hai chương đã khép lại. Vườn vẫn lớn, đơn hàng vẫn đến, và mỗi ngày
            mới là một lời hẹn.
          </p>
        </div>
      )}
      <details className="daily-log">
        <summary>Những việc gần đây</summary>
        <ul>
          {game.logs.map((log, i) => (
            <li key={i}>{log}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
