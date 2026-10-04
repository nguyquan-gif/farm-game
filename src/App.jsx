import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";
import useGame from "./hooks/useGame.js";
import Hud from "./components/Hud.jsx";
import MissionCard from "./components/MissionCard.jsx";
import BottomSheet from "./components/BottomSheet.jsx";
import Feedback from "./components/Feedback.jsx";
import Icon from "./components/Icon.jsx";
import FarmScreen from "./screens/FarmScreen.jsx";
import ShopScreen from "./screens/ShopScreen.jsx";
import StoryScreen from "./screens/StoryScreen.jsx";
import ZoneSheet from "./screens/ZoneSheet.jsx";
import SettingsSheet from "./screens/SettingsSheet.jsx";
import { ZONE_NAMES } from "./data/missions.js";
const tabs = [
  ["farm", "home", "Nông trại"],
  ["shop", "bag", "Tiếp tế"],
  ["story", "book", "Nhật ký"],
];
export default function App() {
  const { game, act, feedback, celebrate, setCelebrate, saveError } = useGame();
  const [tab, setTab] = useState("farm"),
    [sheet, setSheet] = useState(null);
  const open = useCallback((zone) => {
    if (zone === "supplies") {
      setSheet(null);
      setTab("shop");
    } else {
      setTab("farm");
      setSheet(zone);
    }
  }, []);
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
    act({ type: "RESET" });
    setSheet(null);
    setTab("farm");
    setCelebrate(false);
  };
  return (
    <div className="game-shell">
      <Hud
        game={game}
        onSettings={() => setSheet("settings")}
        onEnergy={() => open("rest")}
      />
      <MissionCard game={game} onOpen={open} />
      {saveError && (
        <div className="save-alert" role="status">
          {saveError}
        </div>
      )}
      <main key={tab} className="game-main">
        {tab === "farm" ? (
          <FarmScreen game={game} onOpen={open} />
        ) : tab === "shop" ? (
          <ShopScreen game={game} act={act} />
        ) : (
          <StoryScreen game={game} onOpen={open} />
        )}
      </main>
      <nav className="bottom-nav" aria-label="Điều hướng trò chơi">
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon name={icon} size={24} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {!sheet && !celebrate && game.starterSeen && (
        <Feedback feedback={feedback} />
      )}
      {!game.starterSeen && !sheet && (
        <BottomSheet
          feedback={feedback}
          title="Một mùa mới đang đợi"
          subtitle="Chào mừng về nhà"
          onClose={() =>
            act({ type: "SETTING", key: "starterSeen", value: true })
          }
        >
          <div className="welcome-art">
            <Icon name="leaf" size={66} />
          </div>
          <p className="welcome-copy">
            Ông để lại một mảnh vườn, hai chú gà và những người hàng xóm tốt
            bụng. Hãy cùng đánh thức thung lũng nhé.
          </p>
          <div className="welcome-steps">
            <span>Chăm vườn</span>
            <Icon name="arrow" size={16} />
            <span>Giao nông sản</span>
            <Icon name="arrow" size={16} />
            <span>Mở phiên chợ</span>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              act({ type: "SETTING", key: "starterSeen", value: true });
              open("field");
            }}
          >
            Hái giỏ rau đầu tiên
            <Icon name="arrow" size={18} />
          </button>
          <p className="quiet-note">
            Chơi theo nhịp của bạn. Sang ngày mới luôn miễn phí.
          </p>
        </BottomSheet>
      )}
      {sheet && !celebrate && (
        <BottomSheet
          key={sheet}
          feedback={feedback}
          title={
            ZONE_NAMES[sheet] ||
            {
              settings: "Góc bình yên",
              rest: "Một giấc ngủ, một ngày mới",
              exit: "Hẹn bạn mùa xanh sau",
            }[sheet]
          }
          subtitle={sheet === "settings" ? "Cài đặt" : "Nông trại của bạn"}
          onClose={() => setSheet(null)}
        >
          {sheet === "settings" ? (
            <SettingsSheet
              game={game}
              act={act}
              onReset={reset}
              saveError={saveError}
            />
          ) : sheet === "rest" ? (
            <>
              <div className="zone-hero rest-hero">
                <Icon name="moon" size={68} />
                <h3>Hẹn bạn ở ngày {game.day + 1}</h3>
                <p>
                  5/5 năng lượng · Thêm {game.waterFixed ? 25 : 10}% nước
                  <br />
                  Rau đang lớn sẽ chín · Gà đã ăn sẽ có trứng
                  <br />
                  Kho thức ăn giảm 5% mỗi đêm.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  act({ type: "NEXT_DAY" });
                  setSheet(null);
                }}
              >
                Bắt đầu ngày {game.day + 1}
                <Icon name="sun" size={18} />
              </button>
              <p className="quiet-note">
                Không cần chờ · Không tốn xu hoặc ngọc
              </p>
            </>
          ) : sheet === "exit" ? (
            <>
              <p className="welcome-copy">
                Tiến trình đã được lưu trên thiết bị. Bạn có thể quay lại bất cứ
                lúc nào.
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
            <ZoneSheet zone={sheet} game={game} act={act} onOpen={open} />
          )}
        </BottomSheet>
      )}
      {celebrate && (
        <BottomSheet
          feedback={feedback}
          title="Thung lũng lại rộn ràng!"
          subtitle="Chương 1 hoàn thành"
          onClose={() => {
            setCelebrate(false);
            setSheet(null);
          }}
        >
          <div className="celebration-art">
            <Icon name="market" size={82} />
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ "--angle": `${i * 30}deg` }} />
            ))}
          </div>
          <p className="welcome-copy">
            Từ giỏ rau đầu tiên đến một phiên chợ đầy tiếng cười. Linh và cả
            thung lũng cảm ơn bạn.
          </p>
          <div className="chapter-reward">
            <span>
              <Icon name="coin" />
              +30 xu
            </span>
            <span>
              <Icon name="gem" />
              +2 ngọc
            </span>
          </div>
          <div className="story-letter">
            <p className="eyebrow">Chương 2 đã mở</p>
            <h3>Một mái nhà ấm</h3>
            <p>Sửa mái nhà, mở rộng vườn và tìm lại nhật ký của ông.</p>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setCelebrate(false);
              open("house");
            }}
          >
            Viết tiếp câu chuyện
            <Icon name="arrow" size={18} />
          </button>
        </BottomSheet>
      )}
    </div>
  );
}
