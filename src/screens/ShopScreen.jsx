import Icon from "../components/Icon.jsx";
export default function ShopScreen({ game, act }) {
  return (
    <section className="screen content-screen">
      <p className="eyebrow">Chăm một mùa xanh</p>
      <h2>Góc tiếp tế</h2>
      <p className="screen-intro">
        Một ít hạt, một ít yêu thương. Mọi thứ bạn cần để khu vườn tiếp tục lớn.
      </p>
      <div className="supply-row">
        <span className="item-art seed-art">
          <Icon name="leaf" size={36} />
        </span>
        <div>
          <h3>Hạt rau xanh</h3>
          <p>3 túi hạt · đang có {game.seeds}</p>
        </div>
        <button
          className="price-button"
          onClick={() => act({ type: "BUY_SEEDS" })}
        >
          <Icon name="coin" size={16} />
          15
        </button>
      </div>
      <div className="supply-row">
        <span className="item-art feed-art">
          <Icon name="chicken" size={36} />
        </span>
        <div>
          <h3>Thức ăn cho gà</h3>
          <p>Thêm 40% · kho {game.feed}%</p>
        </div>
        <button
          className="price-button"
          disabled={game.feed >= 100}
          onClick={() => act({ type: "BUY_FEED" })}
        >
          <Icon name="coin" size={16} />
          20
        </button>
      </div>
      <div className="neighbor-gift">
        <Icon name="gift" size={40} />
        <p className="eyebrow">Từ những người hàng xóm</p>
        <h3>Luôn có một khởi đầu mới</h3>
        <p>
          20 xu, 2 túi hạt và 30% thức ăn. Một món quà miễn phí mỗi ngày chơi.
        </p>
        <button
          className="primary-button"
          disabled={game.rescueDay === game.day}
          onClick={() => act({ type: "HELP" })}
        >
          {game.rescueDay === game.day
            ? "Đã nhận · Hẹn ngày mai"
            : "Nhận quà hôm nay"}
        </button>
      </div>
      <p className="quiet-note">
        Thiếu nước? Hứng nước mưa miễn phí ở bể.
        <br />
        Hết năng lượng? Sang ngày mới tại nhà.
      </p>
    </section>
  );
}
