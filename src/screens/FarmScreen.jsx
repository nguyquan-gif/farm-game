import FarmMap from "../components/FarmMap.jsx";
import Icon from "../components/Icon.jsx";
export default function FarmScreen({ game, onOpen, act, feedback }) {
  const dailyCount = Object.values(game.daily).filter(Boolean).length;
  return (
    <div className="farm-screen">
      <FarmMap game={game} onOpen={onOpen} act={act} feedback={feedback} />
      <div className="world-tools">
        <button
          onClick={() => onOpen("daily")}
          aria-label={`Một ngày trọn vẹn, ${dailyCount}/3 việc`}
          className={
            dailyCount === 3 && game.dailyRewardDay !== game.day ? "ready" : ""
          }
        >
          <Icon name="gift" size={24} />
          <span>{dailyCount}/3</span>
        </button>
        <button onClick={() => onOpen("rest")} aria-label="Sang ngày mới">
          <Icon name="moon" size={25} />
          <span>Nghỉ ngơi</span>
        </button>
      </div>
    </div>
  );
}
