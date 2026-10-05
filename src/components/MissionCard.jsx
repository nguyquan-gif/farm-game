import { MISSIONS, CHAPTERS } from "../data/missions.js";
import { missionIndex } from "../game/engine.js";
import Icon from "./Icon.jsx";
export default function MissionCard({ game, onOpen }) {
  const index = missionIndex(game),
    mission = MISSIONS[index],
    chapter = CHAPTERS[mission?.chapter === 1 ? 0 : 1];
  return (
    <button
      key={index}
      className={`mission-card ${!mission ? "chapter-done" : ""}`}
      onClick={() => onOpen(mission?.target || "market")}
    >
      <span className="mission-portrait">
        <img src="./art/linh-portrait.webp" alt="Linh" />
        <i>
          <Icon name={mission ? "book" : "check"} size={13} />
        </i>
      </span>
      <span className="mission-copy">
        <span className="eyebrow">
          {mission
            ? `Chương ${mission.chapter} · ${index - chapter.start + 1}/${chapter.end - chapter.start}`
            : "Hai chương đã hoàn thành"}
          <span className="quest-progress">
            {Math.round((index / MISSIONS.length) * 100)}%
          </span>
        </span>
        <strong>{mission?.title || "Thung lũng đã có cậu"}</strong>
        <span className="mission-action">
          {mission?.action || "Tiếp tục chăm vườn & giao đơn"}
          <Icon name="arrow" size={16} />
        </span>
      </span>
      <span
        className="mission-progress"
        style={{ "--progress": `${(index / MISSIONS.length) * 100}%` }}
      />
    </button>
  );
}
