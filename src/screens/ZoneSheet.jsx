import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import Produce from "../components/Produce.jsx";
import LinhNote from "../components/LinhNote.jsx";
import OrderCard from "../components/OrderCard.jsx";
import { MISSIONS } from "../data/missions.js";
import { CROPS, cropUnlocked } from "../data/crops.js";
import {
  FIRST_ORDER,
  SPECIAL_ORDER,
  FEAST_ORDER,
  dailyOrders,
} from "../data/orders.js";
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
function Action({ children, type, act, secondary = false, disabled = false }) {
  return (
    <button
      className={secondary ? "secondary-button" : "primary-button"}
      disabled={disabled}
      onClick={() => act({ type })}
    >
      {children}
    </button>
  );
}
export default function ZoneSheet({ zone, game, act, onOpen, focusPlot }) {
  const index = missionIndex(game),
    mission = MISSIONS[index];
  const [selectedCrop, setSelectedCrop] = useState(
    mission?.flag === "tomato"
      ? "tomato"
      : mission?.flag === "flowers"
        ? "sunflower"
        : "greens",
  );
  return (
    <>
      {mission?.target === zone && <LinhNote>{mission.story}</LinhNote>}
      {zone === "field" && (
        <>
          <div className="stock-line">
            <span>
              <Produce kind="seeds" size={23} />
              {game.seeds} túi hạt
            </span>
            <span>
              <Icon name="water" size={19} />
              {game.water}% nước
            </span>
            <span>
              1 thao tác = 1<Icon name="energy" size={14} />
            </span>
          </div>
          {game.plots.some((p) => p.state === "empty") &&
            mission?.flag !== "harvest" && (
              <>
                <h3 className="section-label">Hôm nay mình trồng gì?</h3>
                <div
                  className="seed-choices"
                  role="group"
                  aria-label="Chọn giống cây"
                >
                  {Object.entries(CROPS).map(([id, c]) => {
                    const unlocked = cropUnlocked(game, id);
                    return (
                      <button
                        key={id}
                        aria-pressed={selectedCrop === id}
                        className={selectedCrop === id ? "selected" : ""}
                        disabled={!unlocked}
                        onClick={() => setSelectedCrop(id)}
                      >
                        <Produce kind={id} size={40} />
                        <b>{c.name}</b>
                        <small>
                          {unlocked
                            ? `${c.seeds} hạt · ${c.time / 60000} phút`
                            : id === "tomato"
                              ? "Sửa nhà để mở"
                              : "Giúp Bình để mở"}
                        </small>
                        {!unlocked && <Icon name="lock" size={14} />}
                      </button>
                    );
                  })}
                </div>
                <p className="crop-benefit">
                  {CROPS[selectedCrop].description}. Tưới để thu thêm 1.
                </p>
              </>
            )}
          <div className="plot-list">
            {game.plots.map((p) => (
              <article
                className={`plot-row plot-${p.state} ${focusPlot === p.id ? "focused-plot" : ""}`}
                key={p.id}
              >
                <div className="plot-art">
                  <Produce
                    kind={p.state === "empty" ? "seeds" : p.crop}
                    size={44}
                  />
                </div>
                <div className="plot-info">
                  <h3>
                    Luống {p.id} ·{" "}
                    {p.state === "empty" ? "Đất trống" : CROPS[p.crop].name}
                  </h3>
                  <p>
                    {p.state === "ready" ? (
                      `Hái ${CROPS[p.crop].yield + (p.watered ? 1 : 0)} ${CROPS[p.crop].name.toLowerCase()}`
                    ) : p.state === "growing" ? (
                      <>
                        {p.watered ? "Đã tưới · " : "Cần tưới · "}
                        <Countdown until={p.readyAt} />
                      </>
                    ) : (
                      `Gieo ${CROPS[selectedCrop].name.toLowerCase()}`
                    )}
                  </p>
                </div>
                <button
                  className={
                    p.state === "ready" ? "primary-button" : "plot-action"
                  }
                  disabled={p.state === "growing" && p.watered}
                  onClick={() =>
                    act({
                      type:
                        p.state === "ready"
                          ? "HARVEST"
                          : p.state === "empty"
                            ? "PLANT"
                            : "WATER",
                      plotId: p.id,
                      crop: p.state === "empty" ? selectedCrop : undefined,
                    })
                  }
                >
                  {p.state === "ready"
                    ? "Thu hoạch"
                    : p.state === "empty"
                      ? "Gieo"
                      : p.watered
                        ? "Đang lớn"
                        : "Tưới"}
                </button>
              </article>
            ))}
          </div>
          {game.milestones.market && game.plots.length < 3 && (
            <Action type="UPGRADE_FIELD" act={act} secondary>
              Mở luống thứ 3 · 70 xu + 1 năng lượng
            </Action>
          )}
          {game.plots.some((p) => p.state === "growing") && (
            <button className="text-button" onClick={() => onOpen("rest")}>
              <Icon name="moon" size={17} />
              Nghỉ sang ngày mới để cây lớn ngay
              <Icon name="arrow" size={15} />
            </button>
          )}
          <button className="text-button" onClick={() => onOpen("supplies")}>
            Mua hạt hoặc nhận quà hàng xóm
            <Icon name="arrow" size={16} />
          </button>
        </>
      )}
      {zone === "coop" && (
        <>
          <div className="scene-window coop-window">
            <span>
              {game.coop.status === "hungry"
                ? "Mơ & Mận đang đói"
                : game.coop.status === "fed"
                  ? "Một giấc ngủ sau bữa ăn"
                  : "Có quà trong ổ rơm"}
            </span>
          </div>
          <div className="stock-line">
            <span>
              <Icon name="chicken" size={19} />
              Thức ăn {game.feed}%
            </span>
            <span>
              <Produce kind="eggs" size={23} />
              {game.eggs} trứng trong giỏ
            </span>
          </div>
          {game.coop.status === "hungry" ? (
            <Action type="FEED" act={act}>
              Cho Mơ & Mận ăn · 1 năng lượng
            </Action>
          ) : game.coop.status === "egg-ready" ? (
            <Action type="COLLECT" act={act}>
              Nhặt {game.chickens} trứng · 1 năng lượng
            </Action>
          ) : (
            <>
              <p className="time-note">
                <Icon name="egg" size={22} />
                Trứng sẵn sàng sau <Countdown until={game.coop.readyAt} />
              </p>
              <button className="primary-button" onClick={() => onOpen("rest")}>
                Nghỉ sang ngày mới, nhận trứng
                <Icon name="moon" size={18} />
              </button>
              <button
                className="secondary-button"
                onClick={() => onOpen("field")}
              >
                Chăm vườn trong lúc chờ
              </button>
            </>
          )}
          <p className="quiet-note">
            {game.chickens} cô gà · Mỗi bữa dùng 15% thức ăn. Có trứng sau 2
            phút hoặc vào ngày mới.
          </p>
          {game.milestones.market && game.chickens < 4 && (
            <Action type="UPGRADE_COOP" act={act} secondary>
              Đón thêm gà · 5 ngọc + 1 năng lượng
            </Action>
          )}
          <button className="text-button" onClick={() => onOpen("supplies")}>
            Nhận thức ăn miễn phí
            <Icon name="arrow" size={16} />
          </button>
        </>
      )}
      {zone === "water" && (
        <>
          <div className="scene-window water-window">
            <span>
              {game.waterFixed ? "Dòng nước đã nối lại" : "Ống cũ đang rò rỉ"}
            </span>
          </div>
          <div className="resource-meter">
            <Icon name="water" size={23} />
            <div>
              <b>{game.water}% nước trong bể</b>
              <span>
                <i style={{ width: `${game.water}%` }} />
              </span>
            </div>
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
            Hứng thêm 30% nước · Miễn phí
          </Action>
          <p className="quiet-note">
            {game.waterFixed
              ? "Bể hồi 25% mỗi đêm; ngày mưa hồi 40%."
              : "Ống rò chỉ hồi 10% mỗi đêm. Sửa để hồi 25%."}
            <br />
            Tưới một luống dùng 10% nước.
          </p>
        </>
      )}
      {zone === "house" && (
        <>
          <div className="scene-window house-window">
            <span>
              {game.houseFixed
                ? "Nơi những mùa xanh bắt đầu"
                : "Mái nhà nhỏ của ông"}
            </span>
          </div>
          {game.milestones.market && !game.houseFixed && (
            <Action type="UPGRADE_HOUSE" act={act}>
              Tu sửa mái nhà · 80 xu + 1 năng lượng
            </Action>
          )}
          {game.houseFixed && (
            <div className="story-letter">
              <p className="eyebrow">Gửi người giữ khu vườn</p>
              <p>
                “Con không cần làm mọi thứ trong một ngày. Hãy chăm một mầm cây,
                mời một người bạn. Rồi thung lũng sẽ có mùa xanh của riêng con.”
              </p>
              <span>— Ông nội</span>
              <p className="unlocked-note">
                <Icon name="check" size={17} />
                Đã mở giống cà chua trong vườn
              </p>
            </div>
          )}
          <button className="primary-button" onClick={() => onOpen("rest")}>
            Nghỉ sang ngày mới
            <Icon name="moon" size={19} />
          </button>
        </>
      )}
      {zone === "market" && (
        <>
          {index < 4 ? (
            <div className="locked-story">
              <img src="./art/linh-portrait.webp" alt="Linh đợi trước chợ" />
              <h3>Mình đợi giỏ đầu tiên của cậu.</h3>
              <p>
                Chăm vườn và đàn gà trước nhé. Khi có đủ rau, trứng, chúng mình
                sẽ nấu bữa cơm mở chợ.
              </p>
              <button
                className="primary-button"
                onClick={() => onOpen(mission.target)}
              >
                {mission.action}
                <Icon name="arrow" size={17} />
              </button>
            </div>
          ) : !game.milestones.order ? (
            <OrderCard
              order={FIRST_ORDER}
              game={game}
              act={act}
              onOpen={onOpen}
            />
          ) : !game.milestones.market ? (
            <div className="market-ready">
              <Icon name="market" size={55} />
              <h3>Khách đầu tiên đang đến!</h3>
              <p>Bữa cơm đã sẵn sàng. Chúng mình mở phiên chợ thôi.</p>
              <Action type="OPEN_MARKET" act={act}>
                Mở phiên chợ · 1 năng lượng
              </Action>
            </div>
          ) : (
            <>
              {game.milestones.tomato && !game.milestones.specialOrder && (
                <OrderCard
                  order={SPECIAL_ORDER}
                  type="SPECIAL_ORDER"
                  game={game}
                  act={act}
                  onOpen={onOpen}
                />
              )}
              {game.milestones.flowers && !game.milestones.feast && (
                <OrderCard
                  order={FEAST_ORDER}
                  type="PREPARE_FEAST"
                  game={game}
                  act={act}
                  onOpen={onOpen}
                />
              )}
              {game.milestones.feast && !game.milestones.festival && (
                <Action type="START_FESTIVAL" act={act}>
                  Thắp đèn hội mùa · 1 năng lượng
                  <Icon name="star" size={21} />
                </Action>
              )}
              <div className="section-heading">
                <h3>Đơn hàng ngày {game.day}</h3>
                <span>Không có hạn chót</span>
              </div>
              {dailyOrders(game).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  game={game}
                  act={act}
                  onOpen={onOpen}
                  done={game.deliveredOrders.includes(order.id)}
                />
              ))}
              <Action type="SELL" act={act} secondary>
                Bán cải & trứng dư · 1 năng lượng
              </Action>
              <p className="quiet-note">
                Đơn hàng trả tốt hơn. Cà chua và hoa luôn được giữ lại cho hội
                mùa.
              </p>
            </>
          )}
        </>
      )}
      {!game.energy && zone !== "house" && (
        <div className="recovery-note">
          <Icon name="energy" size={22} />
          <div>
            <b>Mình nghỉ một chút nhé?</b>
            <p>Ngày mới hồi đủ 5 năng lượng, hoàn toàn miễn phí.</p>
          </div>
          <button className="text-button" onClick={() => onOpen("rest")}>
            Nghỉ ngay
            <Icon name="arrow" size={15} />
          </button>
        </div>
      )}
    </>
  );
}
