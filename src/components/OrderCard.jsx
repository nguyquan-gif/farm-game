import Icon from "./Icon.jsx";
import Produce from "./Produce.jsx";
import { ITEM_NAMES } from "../data/crops.js";
import { canFulfill } from "../data/orders.js";
export default function OrderCard({
  order,
  game,
  act,
  onOpen,
  type = "DELIVER",
  done = false,
}) {
  const ready = canFulfill(game, order);
  return (
    <article
      className={`order-paper ${ready ? "order-ready" : ""} ${done ? "order-done" : ""}`}
    >
      <header>
        <span className="order-stamp">
          <Icon name={done ? "check" : "bag"} size={23} />
        </span>
        <div>
          <p className="eyebrow">{order.person}</p>
          <h3>{order.name}</h3>
        </div>
        {done && <span className="done-label">Đã giao</span>}
      </header>
      <p className="order-note">{order.note}</p>
      <div className="order-items">
        {Object.entries(order.needs).map(([item, quantity]) => (
          <button
            key={item}
            className={`order-item ${game[item] >= quantity ? "enough" : "missing"}`}
            onClick={() => onOpen(item === "eggs" ? "coop" : "field")}
            aria-label={`${ITEM_NAMES[item]}: có ${game[item]}, cần ${quantity}. Đến ${item === "eggs" ? "chuồng gà" : "vườn"}`}
          >
            <Produce kind={item} size={38} />
            <span>
              {ITEM_NAMES[item]}
              <b>
                {Math.min(game[item], quantity)}/{quantity}{" "}
                {game[item] >= quantity ? (
                  <Icon name="check" size={12} />
                ) : (
                  <Icon name="arrow" size={12} />
                )}
              </b>
            </span>
          </button>
        ))}
      </div>
      <footer>
        <span>
          <Icon name="coin" size={19} />
          <b>{order.coins}</b>
          {order.gems > 0 && (
            <>
              <Icon name="gem" size={17} />
              <b>{order.gems}</b>
            </>
          )}
        </span>
        <button
          className="primary-button"
          disabled={done}
          onClick={() => act({ type, orderId: order.id })}
        >
          {done ? "Hẹn ngày mai" : ready ? "Giao giỏ" : "Kiểm tra giỏ"}
          {!done && (
            <small>
              1<Icon name="energy" size={13} />
            </small>
          )}
        </button>
      </footer>
      {!ready && !done && (
        <p className="quiet-note">Chạm vào món còn thiếu để đến nơi lấy.</p>
      )}
    </article>
  );
}
