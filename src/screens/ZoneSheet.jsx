import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import { MISSIONS } from "../data/missions.js";
import { missionIndex } from "../game/engine.js";
function Countdown({ until }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = Math.max(0, Math.ceil((until - now) / 1000));
  return (
    <span>
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}
function Action({
  children,
  type,
  act,
  plotId,
  disabled = false,
  secondary = false,
}) {
  return (
    <button
      className={secondary ? "secondary-button" : "primary-button"}
      disabled={disabled}
      onClick={() => act({ type, plotId })}
    >
      {children}
    </button>
  );
}
export default function ZoneSheet({ zone, game, act, onOpen }) {
  const index = missionIndex(game),
    mission = MISSIONS[index];
  return (
    <>
      {mission?.target === zone && (
        <div className="story-note">
          <Icon name="book" size={20} />
          <p>{mission.story}</p>
        </div>
      )}
      {zone === "field" && (
        <>
          <div className="stock-line">
            <span>
              <Icon name="leaf" size={18} />
              {game.seeds} túi hạt
            </span>
            <span>
              <Icon name="water" size={18} />
              {game.water}% nước
            </span>
          </div>
          {game.plots.map((p) => (
            <div className={`plot-row plot-${p.state}`} key={p.id}>
              <div className="plot-art">
                <Icon
                  name={
                    p.state === "empty"
                      ? "leaf"
                      : p.state === "growing"
                        ? "leaf"
                        : "bag"
                  }
                  size={30}
                />
                <span className="soil-line" />
              </div>
              <div className="plot-info">
                <h3>Luống rau {p.id}</h3>
                <p>
                  {p.state === "ready" ? (
                    "Rau đã xanh, hái thôi!"
                  ) : p.state === "growing" ? (
                    <>
                      {p.watered ? "Đã tưới · " : "Đang lớn · "}
                      <Countdown until={p.readyAt} />
                    </>
                  ) : (
                    "Đất tơi, sẵn sàng gieo"
                  )}
                </p>
              </div>
              <Action
                type={
                  p.state === "ready"
                    ? "HARVEST"
                    : p.state === "empty"
                      ? "PLANT"
                      : "WATER"
                }
                act={act}
                plotId={p.id}
                disabled={p.state === "growing" && p.watered}
              >
                {p.state === "ready"
                  ? "Hái rau"
                  : p.state === "empty"
                    ? "Gieo hạt"
                    : p.watered
                      ? "Đã tưới"
                      : "Tưới"}
                <small>
                  1<Icon name="energy" size={13} />
                </small>
              </Action>
            </div>
          ))}
          <p className="quiet-note">
            Rau lớn trong 2 phút. Tưới còn tối đa 1 phút.
            <br />
            Sang ngày mới để thu hoạch ngay.
          </p>
          {game.milestones.market && game.plots.length < 3 && (
            <Action type="UPGRADE_FIELD" act={act} secondary>
              Mở luống thứ 3 · 70 xu + 1 năng lượng
            </Action>
          )}
          <button className="text-button" onClick={() => onOpen("supplies")}>
            Mua hạt hoặc nhận giúp đỡ
            <Icon name="arrow" size={16} />
          </button>
        </>
      )}
      {zone === "coop" && (
        <>
          <div className={`zone-hero coop-hero ${game.coop.status}`}>
            <Icon name="chicken" size={76} />
            {game.coop.status === "egg-ready" && <Icon name="egg" size={34} />}
            <h3>
              {game.coop.status === "hungry"
                ? "Hai chiếc bụng nhỏ đang đói"
                : game.coop.status === "fed"
                  ? "Đàn gà đang nghỉ sau bữa ăn"
                  : "Có trứng trong ổ rơm!"}
            </h3>
            <p>
              {game.coop.status === "fed" ? (
                <>
                  Trứng sẵn sàng sau <Countdown until={game.coop.readyAt} />
                </>
              ) : game.coop.status === "hungry" ? (
                "Cho ăn, chờ một chút, rồi nhận trứng tươi."
              ) : (
                "Chạm để cất trứng vào giỏ của bạn."
              )}
            </p>
          </div>
          <div className="stock-line">
            <span>Thức ăn {game.feed}%</span>
            <span>{game.eggs} trứng trong giỏ</span>
          </div>
          {game.coop.status === "hungry" ? (
            <Action type="FEED" act={act}>
              Cho gà ăn · 15% thức ăn + 1 năng lượng
            </Action>
          ) : game.coop.status === "egg-ready" ? (
            <Action type="COLLECT" act={act}>
              Nhặt {game.chickens} trứng · 1 năng lượng
            </Action>
          ) : (
            <button className="primary-button" onClick={() => onOpen("rest")}>
              Sang ngày mới, nhận trứng
              <Icon name="moon" size={18} />
            </button>
          )}
          <button className="text-button" onClick={() => onOpen("supplies")}>
            Bổ sung thức ăn miễn phí
            <Icon name="arrow" size={16} />
          </button>
        </>
      )}
      {zone === "water" && (
        <>
          <div className="zone-hero water-hero">
            <div className="tank-art">
              <div style={{ height: `${game.water}%` }} />
              <Icon name="water" size={38} />
            </div>
            <h3>
              {!game.waterFixed
                ? "Một đường ống cần được chăm sóc"
                : game.water < 20
                  ? "Bể nước sắp cạn"
                  : "Dòng nước đã yên bình"}
            </h3>
            <p>
              {game.water}/100% ·{" "}
              {game.waterFixed
                ? "Bổ sung 25% mỗi ngày mới"
                : "Rò rỉ làm giảm lượng nước hồi mỗi đêm"}
            </p>
          </div>
          {!game.waterFixed && (
            <Action type="REPAIR" act={act}>
              Sửa đường ống · 40 xu + 1 năng lượng
            </Action>
          )}
          <Action
            type="REFILL"
            act={act}
            secondary
            disabled={game.water >= 100}
          >
            Hứng thêm 30% nước mưa · Miễn phí
          </Action>
          <p className="quiet-note">
            Thiếu xu sửa bể? Thu hoạch rau hoặc nhận quà hàng xóm ở Góc tiếp tế.
          </p>
        </>
      )}
      {zone === "house" && (
        <>
          <div className="zone-hero home-hero">
            <Icon name="home" size={78} />
            <h3>
              {game.houseFixed
                ? "Một mái nhà, một mùa xanh"
                : "Chào mừng bạn trở về nhà"}
            </h3>
            <p>Ngày {game.day} · Nơi bắt đầu những điều bình dị.</p>
          </div>
          <button className="primary-button" onClick={() => onOpen("rest")}>
            Nghỉ sang ngày mới
            <Icon name="moon" size={18} />
          </button>
          {game.milestones.market && !game.houseFixed && (
            <Action type="UPGRADE_HOUSE" act={act} secondary>
              Tu sửa mái nhà · 80 xu + 1 năng lượng
            </Action>
          )}
          {game.houseFixed && (
            <div className="story-letter">
              <p className="eyebrow">Cuốn nhật ký của ông</p>
              <p>
                “Điều quý nhất của một nông trại không phải mùa bội thu, mà là
                những người cùng con chăm nó.”
              </p>
            </div>
          )}
        </>
      )}
      {zone === "market" && (
        <>
          {index < 4 ? (
            <div className="zone-hero">
              <Icon name="lock" size={64} />
              <h3>Linh đang chuẩn bị phiên chợ</h3>
              <p>Hoàn thành bốn nhiệm vụ đầu để mang giỏ nông sản đến đây.</p>
              <button
                className="primary-button"
                onClick={() => onOpen(MISSIONS[index].target)}
              >
                Tiếp tục nhiệm vụ
                <Icon name="arrow" size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="linh-letter">
                <span className="linh-avatar" aria-hidden="true">
                  <svg viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="40" fill="#e6c99f" />
                    <path d="M12 80q0-31 28-31t28 31" fill="#739368" />
                    <path d="M21 37q-3-31 19-31 25 1 21 38" fill="#5c4934" />
                    <ellipse cx="40" cy="34" rx="16" ry="20" fill="#f1c499" />
                    <path
                      d="M23 29q20-1 28-16l9 15q-1-22-20-21T23 29"
                      fill="#5c4934"
                    />
                    <circle cx="34" cy="34" r="1.5" fill="#674f38" />
                    <circle cx="47" cy="34" r="1.5" fill="#674f38" />
                    <path
                      d="M36 43q5 5 10 0"
                      stroke="#bd765f"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>
                <div>
                  <h3>Linh · Người bạn ở thung lũng</h3>
                  <p>“Rau từ vườn bạn sẽ làm bữa trưa thơm hơn.”</p>
                </div>
              </div>
              {!game.milestones.order || game.milestones.market ? (
                <>
                  <div className="order-paper">
                    <p className="eyebrow">Đơn hàng ngày {game.day}</p>
                    <div>
                      <span>
                        <Icon name="leaf" />
                        Rau xanh
                      </span>
                      <b>{Math.min(3, game.veg)}/3</b>
                    </div>
                    <div>
                      <span>
                        <Icon name="egg" />
                        Trứng tươi
                      </span>
                      <b>{Math.min(1, game.eggs)}/1</b>
                    </div>
                    <footer>
                      <span>Phần thưởng</span>
                      <strong>70 xu + 1 ngọc</strong>
                    </footer>
                  </div>
                  <Action
                    type="DELIVER"
                    act={act}
                    disabled={game.orderDay === game.day}
                  >
                    {game.orderDay === game.day
                      ? "Đã giao hôm nay"
                      : "Giao đơn cho Linh · 1 năng lượng"}
                  </Action>
                </>
              ) : (
                <div className="order-complete">
                  <Icon name="check" size={36} />
                  <h3>Giỏ nông sản đã đến nơi!</h3>
                  <p>Linh đã sẵn sàng mở phiên chợ cùng bạn.</p>
                </div>
              )}
              {!game.milestones.market && game.milestones.order && (
                <Action type="OPEN_MARKET" act={act}>
                  Mở phiên chợ · 1 năng lượng
                  <Icon name="star" size={20} />
                </Action>
              )}
              {game.milestones.market && (
                <Action type="SELL" act={act} secondary>
                  Bán nông sản còn lại · 1 năng lượng
                </Action>
              )}
            </>
          )}
        </>
      )}
      {!game.energy && zone !== "house" && (
        <div className="recovery-note">
          <Icon name="energy" size={18} />
          <span>Hết năng lượng rồi. Một giấc ngủ sẽ hồi đủ 5.</span>
          <button className="text-button" onClick={() => onOpen("rest")}>
            Nghỉ ngay
          </button>
        </div>
      )}
    </>
  );
}
