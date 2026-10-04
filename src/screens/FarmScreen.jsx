import FarmMap from "../components/FarmMap.jsx";
import Icon from "../components/Icon.jsx";
export default function FarmScreen({ game, onOpen }) {
  return (
    <div className="screen farm-screen">
      <FarmMap game={game} onOpen={onOpen} />
      <div className="farm-footer">
        <div className="basket-summary">
          <Icon name="bag" size={18} />
          <span>Trong giỏ của bạn</span>
          <b>
            {game.veg} rau · {game.eggs} trứng
          </b>
        </div>
        <button className="next-day-button" onClick={() => onOpen("rest")}>
          <span className="moon-medallion">
            <Icon name="moon" size={22} />
          </span>
          <span>
            <b>Sang ngày mới</b>
            <small>Hồi năng lượng · Rau lớn · Miễn phí</small>
          </span>
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </div>
  );
}
