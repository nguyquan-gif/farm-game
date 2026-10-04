import Icon from "./Icon.jsx";
import { MISSIONS } from "../data/missions.js";
import { missionIndex } from "../game/engine.js";
export default function MissionCard({ game, onOpen }) {
  const index = missionIndex(game),
    done = index === MISSIONS.length;
  const mission = MISSIONS[Math.min(index, MISSIONS.length - 1)];
  return (
    <button
      className={`mission-card ${done ? "chapter-done" : ""}`}
      onClick={() => onOpen(done ? "house" : mission.target)}
    >
      <span className="mission-emblem">
        <Icon name={done ? "star" : "book"} size={26} />
      </span>
      <span className="mission-copy">
        <span className="eyebrow">
          {done ? "Chương 2 · Một mái nhà ấm" : `Chương 1 · ${index + 1}/6`}
        </span>
        <strong>{done ? "Viết tiếp câu chuyện của bạn" : mission.title}</strong>
        <span className="mission-action">
          {done ? "Khám phá cuốn nhật ký" : mission.action}
          <Icon name="arrow" size={16} />
        </span>
      </span>
      <span className="mission-dots" aria-hidden="true">
        {MISSIONS.map((m, i) => (
          <i
            key={m.flag}
            className={i < index ? "done" : i === index ? "current" : ""}
          />
        ))}
      </span>
    </button>
  );
}
