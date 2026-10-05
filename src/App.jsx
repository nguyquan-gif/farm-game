import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import useGame from "./hooks/useGame.js";
import Hud from "./components/Hud.jsx";
import MissionCard from "./components/MissionCard.jsx";
import BottomSheet from "./components/BottomSheet.jsx";
import Feedback from "./components/Feedback.jsx";
import Icon from "./components/Icon.jsx";
import LinhNote from "./components/LinhNote.jsx";
import FarmScreen from "./screens/FarmScreen.jsx";
import ShopScreen from "./screens/ShopScreen.jsx";
import StoryScreen from "./screens/StoryScreen.jsx";
import ZoneSheet from "./screens/ZoneSheet.jsx";
import SettingsSheet from "./screens/SettingsSheet.jsx";
import { ZONE_NAMES } from "./data/missions.js";
const tabs = [
  ["farm", "home", "Nông trại"],
  ["orders", "market", "Đơn hàng"],
  ["shop", "bag", "Kho đồ"],
  ["story", "book", "Nhật ký"],
];
export default function App() {
  const { game, act, feedback, celebrate, setCelebrate, saveError } = useGame();
  const [tab, setTab] = useState("farm"),
    [sheet, setSheet] = useState(null),
    [focusPlot, setFocusPlot] = useState(null),
    [daybreak, setDaybreak] = useState(null);
  const open = useCallback((zone, plotId = null) => {
    setFocusPlot(plotId);
    if (zone === "supplies") {
      setSheet(null);
      setTab("shop");
    } else {
      setTab("farm");
      setSheet(zone);
    }
  }, []);
  const perform = useCallback(
    (action) => {
      const result = act(action);
      if (result.ok && action.type === "NEXT_DAY")
        setDaybreak(result.state.day);
      return result;
    },
    [act],
  );
  useEffect(() => {
    if (!daybreak) return;
    const timer = setTimeout(() => setDaybreak(null), 1500);
    return () => clearTimeout(timer);
  }, [daybreak]);
  const backState = useRef({ sheet, tab, celebrate });
  useEffect(() => {
    backState.current = { sheet, tab, celebrate };
  }, [sheet, tab, celebrate]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let disposed = false,
      listener;
    NativeApp.addListener("backButton", () => {
      const current = backState.current;
      if (current.celebrate) setCelebrate(false);
      else if (current.sheet) setSheet(null);
      else if (current.tab !== "farm") setTab("farm");
      else setSheet("exit");
    }).then((handle) => {
      if (disposed) handle.remove();
      else listener = handle;
    });
    return () => {
      disposed = true;
      listener?.remove();
    };
  }, [setCelebrate]);
  const reset = () => {
    perform({ type: "RESET" });
    setSheet(null);
    setTab("farm");
    setCelebrate(false);
  };
  const finishMoment = () => {
    setCelebrate(false);
    setSheet(null);
    setTab("farm");
  };
  return (
    <div className={`game-shell tab-${tab}`}>
      <Hud
        game={game}
        onSettings={() => setSheet("settings")}
        onEnergy={() => open("rest")}
      />
      {saveError && (
        <div className="save-alert" role="status">
          {saveError}
        </div>
      )}
      <main key={tab} className="game-main">
        {tab === "farm" ? (
          <FarmScreen
            game={game}
            onOpen={open}
            act={perform}
            feedback={feedback}
          />
        ) : tab === "shop" ? (
          <ShopScreen game={game} act={perform} onOpen={open} />
        ) : tab === "story" ? (
          <StoryScreen game={game} onOpen={open} />
        ) : (
          <section className="content-screen orders-screen">
            <header className="screen-heading">
              <p className="eyebrow">TỪ VƯỜN NHÀ ĐẾN BẾP LÀNG</p>
              <h2>Bảng đơn hàng</h2>
              <p>Một giỏ nông sản, một người bạn vui hơn.</p>
            </header>
            <ZoneSheet zone="market" game={game} act={perform} onOpen={open} />
          </section>
        )}
      </main>
      <div className="bottom-dock">
        {tab === "farm" && <MissionCard game={game} onOpen={open} />}
        <nav className="bottom-nav" aria-label="Điều hướng trò chơi">
          {tabs.map(([id, icon, label]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon name={icon} size={23} />
              <span>{label}</span>
              {id === "orders" &&
                game.milestones.market &&
                game.deliveredOrders.length === 0 && <i className="nav-dot" />}
            </button>
          ))}
        </nav>
      </div>
      {!sheet && !celebrate && game.starterSeen && (
        <Feedback feedback={feedback} />
      )}
      {!game.starterSeen && !sheet && (
        <BottomSheet
          title="Cậu về rồi, thung lũng đang đợi!"
          subtitle="Lời hẹn ngày trở về"
          onClose={() =>
            perform({ type: "SETTING", key: "starterSeen", value: true })
          }
        >
          <div className="story-opening">
            <img
              src="./art/linh-portrait.webp"
              alt="Linh mỉm cười đón bạn về thung lũng"
            />
            <div>
              <span className="character-tag">Linh</span>
              <h3>
                Mình mở lại
                <br />
                phiên chợ nhé?
              </h3>
              <p>
                Ông để lại một khu vườn. Mình giữ lời hẹn nấu bữa cơm làng. Chỉ
                còn thiếu cậu.
              </p>
            </div>
          </div>
          <p className="opening-goal">
            Hái rau, chăm Mơ & Mận, rồi mang giỏ nông sản sang cho Linh. Từ bữa
            cơm ấy, cả thung lũng sẽ có một khởi đầu mới.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              perform({ type: "SETTING", key: "starterSeen", value: true });
              setSheet(null);
            }}
          >
            Về vườn hái giỏ rau đầu tiên
            <Icon name="arrow" size={18} />
          </button>
          <p className="quiet-note">
            Chạm giỏ trên luống rau để hái. Đi theo dấu ! để tiếp tục câu
            chuyện.
          </p>
        </BottomSheet>
      )}
      {sheet && !celebrate && (
        <BottomSheet
          key={`${sheet}-${focusPlot}`}
          feedback={feedback}
          title={
            ZONE_NAMES[sheet] ||
            {
              settings: "Góc bình yên",
              rest: "Gác lại hôm nay",
              daily: "Một ngày trọn vẹn",
              exit: "Hẹn gặp lại ở thung lũng",
            }[sheet]
          }
          subtitle={
            sheet === "settings"
              ? "Cài đặt"
              : sheet === "daily"
                ? `Ngày ${game.day} · Những niềm vui nhỏ`
                : "GREEN VALLEY FARM"
          }
          onClose={() => setSheet(null)}
        >
          {sheet === "settings" ? (
            <SettingsSheet
              game={game}
              act={perform}
              onReset={reset}
              saveError={saveError}
            />
          ) : sheet === "rest" ? (
            <>
              <div className="rest-art">
                <Icon name="moon" size={47} />
                <span>NGÀY {game.day + 1}</span>
                <h3>
                  {(game.day + 1) % 3 === 0
                    ? "Mai có mưa xuân"
                    : "Một bình minh mới"}
                </h3>
                <p>Vườn vẫn lớn ngay cả khi mình nghỉ ngơi.</p>
              </div>
              <ul className="rest-summary">
                <li>
                  <Icon name="energy" />
                  Hồi đủ <b>5/5 năng lượng</b>
                </li>
                <li>
                  <Icon name="leaf" />
                  {game.plots.filter((p) => p.state === "growing").length} luống
                  đang lớn sẽ thu hoạch được
                </li>
                <li>
                  <Icon name="egg" />
                  {game.coop.status === "fed"
                    ? `${game.chickens} trứng mới đang chờ bạn`
                    : "Cho gà ăn trước khi nghỉ để có trứng"}
                </li>
                <li>
                  <Icon name="water" />
                  Thêm{" "}
                  {(game.day + 1) % 3 === 0 ? 40 : game.waterFixed ? 25 : 10}%
                  nước · Thức ăn giảm 5%
                </li>
              </ul>
              {(game.day + 1) % 3 === 0 && (
                <p className="rain-tip">
                  Mưa sẽ tưới các luống đang lớn, cho thêm 1 nông sản khi hái.
                </p>
              )}
              <button
                className="primary-button"
                onClick={() => {
                  perform({ type: "NEXT_DAY" });
                  setSheet(null);
                }}
              >
                Bắt đầu ngày {game.day + 1}
                <Icon name="sun" size={19} />
              </button>
              <p className="quiet-note">
                Luôn miễn phí · Không có nhiệm vụ bị hết hạn
              </p>
            </>
          ) : sheet === "daily" ? (
            <>
              <LinhNote>
                Mỗi ngày chỉ cần chăm một chút. Làm đủ ba việc để nhận món quà
                nhỏ từ làng nhé.
              </LinhNote>
              <div className="daily-tasks">
                {[
                  ["harvest", "leaf", "Thu hoạch một luống", "field"],
                  ["care", "water", "Tưới cây hoặc cho gà ăn", "field"],
                  ["trade", "market", "Giao đơn hoặc bán nông sản", "market"],
                ].map(([key, icon, label, zone]) => (
                  <button
                    key={key}
                    className={game.daily[key] ? "done" : ""}
                    onClick={() => open(zone)}
                  >
                    <Icon name={game.daily[key] ? "check" : icon} />
                    <span>{label}</span>
                    <Icon name="arrow" size={17} />
                  </button>
                ))}
              </div>
              <div className="daily-prize">
                <Icon name="gift" size={32} />
                <b>35 xu · 2 hạt · 1 ngọc</b>
              </div>
              <button
                className="primary-button"
                disabled={
                  game.dailyRewardDay === game.day ||
                  !Object.values(game.daily).every(Boolean)
                }
                onClick={() => perform({ type: "CLAIM_DAILY" })}
              >
                {game.dailyRewardDay === game.day
                  ? "Đã nhận quà hôm nay"
                  : "Nhận quà một ngày trọn vẹn"}
              </button>
            </>
          ) : sheet === "exit" ? (
            <>
              <p className="opening-goal">
                {saveError
                  ? "Thiết bị đang không lưu được tiến trình. Thoát lúc này có thể mất thay đổi của phiên chơi."
                  : "Tiến trình đã được lưu trên thiết bị. Khu vườn sẽ đợi bạn trở lại."}
              </p>
              <button
                className="primary-button"
                onClick={() => NativeApp.exitApp()}
              >
                Thoát trò chơi
              </button>
              <button
                className="secondary-button"
                onClick={() => setSheet(null)}
              >
                Ở lại nông trại
              </button>
            </>
          ) : (
            <ZoneSheet
              zone={sheet}
              game={game}
              act={perform}
              onOpen={open}
              focusPlot={focusPlot}
            />
          )}
        </BottomSheet>
      )}
      {celebrate && (
        <BottomSheet
          title={
            celebrate === "festival"
              ? "Thung lũng đã có cậu."
              : "Phiên chợ lại rộn ràng!"
          }
          subtitle={
            celebrate === "festival"
              ? "Chương 2 hoàn thành · Đêm hội mùa xanh"
              : "Chương 1 hoàn thành · Lời hẹn ngày trở về"
          }
          onClose={finishMoment}
        >
          <div
            className={`celebration-art ${celebrate === "festival" ? "finale" : ""}`}
          >
            <img src="./art/valley-world.webp" alt="Thung lũng bừng sức sống" />
            <div>
              <Icon name="star" size={33} />
              <h3>
                {celebrate === "festival"
                  ? "Một nơi để trở về"
                  : "Từ một giỏ rau nhỏ…"}
              </h3>
            </div>
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ "--angle": `${i * 30}deg` }} />
            ))}
          </div>
          <LinhNote>
            {celebrate === "festival"
              ? "Cậu đã trồng, chăm, chia sẻ và mang mọi người lại gần nhau. Mình nghĩ đó chính là điều ông muốn gửi lại."
              : "Cậu thấy không? Mọi người đã quay lại rồi. Trong nhà vẫn còn lá thư của ông. Biết đâu mình có thể tổ chức hội mùa như ngày xưa."}
          </LinhNote>
          {celebrate === "festival" ? (
            <div className="ending-stats">
              <span>
                <b>{game.stats.harvests}</b>mùa thu hoạch
              </span>
              <span>
                <b>{game.stats.deliveries}</b>giỏ đã trao
              </span>
              <span>
                <b>{game.day}</b>ngày ở thung lũng
              </span>
            </div>
          ) : (
            <div className="chapter-reward">
              <span>
                <Icon name="coin" />
                +30 xu
              </span>
              <span>
                <Icon name="gem" />
                +2 ngọc
              </span>
              <span>
                <Icon name="market" />
                Bảng đơn hàng
              </span>
            </div>
          )}
          <button
            className="primary-button"
            onClick={() => {
              finishMoment();
              if (celebrate !== "festival") open("house");
            }}
          >
            {celebrate === "festival"
              ? "Ngắm thung lũng đêm hội"
              : "Chương 2 · Tìm lá thư của ông"}
            <Icon name="arrow" size={18} />
          </button>
          {celebrate === "festival" && (
            <p className="quiet-note">
              Câu chuyện đã trọn vẹn. Bạn vẫn có thể chăm vườn, hoàn thành đơn
              hàng và đón ngày mới.
            </p>
          )}
        </BottomSheet>
      )}
      {daybreak && (
        <div className="daybreak" role="status">
          <Icon name="sun" size={51} />
          <h2>Chào ngày {daybreak}</h2>
          <p>
            {daybreak % 3 === 0
              ? "Mưa xuân đang tưới khu vườn"
              : "Nắng đã về bên hiên nhà"}
          </p>
        </div>
      )}
    </div>
  );
}
