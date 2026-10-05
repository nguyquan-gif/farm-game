import Icon from "../components/Icon.jsx";
import Produce from "../components/Produce.jsx";
import LinhNote from "../components/LinhNote.jsx";
import { ITEM_NAMES } from "../data/crops.js";
export default function ShopScreen({ game, act, onOpen }) {
  return (
    <section className="content-screen inventory-screen">
      <header className="screen-heading">
        <p className="eyebrow">NHỮNG ĐIỀU BẠN GÓP NHẶT</p>
        <h2>Giỏ của bạn</h2>
        <p>Mỗi mùa thu hoạch đều dẫn tới một lời hẹn.</p>
      </header>
      <div className="inventory-grid">
        {Object.entries(ITEM_NAMES).map(([key, name]) => (
          <div key={key}>
            <Produce kind={key} size={57} />
            <b>{game[key]}</b>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <button className="primary-button" onClick={() => onOpen("market")}>
        Mang giỏ đến phiên chợ
        <Icon name="arrow" size={18} />
      </button>
      <h3 className="section-label">Tiếp tế cho ngày mai</h3>
      <div className="supply-row">
        <Produce kind="seeds" size={48} />
        <div>
          <h3>3 túi hạt giống</h3>
          <p>Đang có {game.seeds} túi</p>
        </div>
        <button
          className="price-button"
          onClick={() => act({ type: "BUY_SEEDS" })}
        >
          15
          <Icon name="coin" size={18} />
        </button>
      </div>
      <div className="supply-row">
        <Icon name="chicken" size={42} />
        <div>
          <h3>Thức ăn cho gà</h3>
          <p>Thêm 40% · kho đang có {game.feed}%</p>
        </div>
        <button
          className="price-button"
          disabled={game.feed >= 100}
          onClick={() => act({ type: "BUY_FEED" })}
        >
          20
          <Icon name="coin" size={18} />
        </button>
      </div>
      <LinhNote title="Hàng xóm luôn ở đây">
        Thiếu hạt hay thức ăn thì cứ nhận giỏ nhỏ này nhé. Ngày nào cậu cũng có
        thể quay lại.
      </LinhNote>
      <div className="neighbor-gift">
        <Icon name="gift" size={37} />
        <div>
          <b>Gói giúp đỡ hằng ngày</b>
          <p>20 xu · 2 hạt · 30% thức ăn</p>
        </div>
      </div>
      <button
        className="secondary-button"
        disabled={game.rescueDay === game.day}
        onClick={() => act({ type: "HELP" })}
      >
        {game.rescueDay === game.day
          ? "Đã nhận · Hẹn ngày mai"
          : "Nhận quà hôm nay · Miễn phí"}
      </button>
    </section>
  );
}
