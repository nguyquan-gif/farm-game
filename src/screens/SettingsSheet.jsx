import { useState } from "react";
import Icon from "../components/Icon.jsx";
export default function SettingsSheet({ game, act, onReset, saveError }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      {[
        ["soundOn", "Âm thanh thao tác", "sound"],
        ["musicOn", "Nhạc nền thung lũng", "leaf"],
        ["hapticsOn", "Rung nhẹ khi nhận thưởng", "energy"],
      ].map(([key, label, icon]) => (
        <div className="setting-row" key={key}>
          <span>
            <Icon name={icon} />
            {label}
          </span>
          <button
            role="switch"
            aria-checked={game[key]}
            aria-label={label}
            className={`switch ${game[key] ? "on" : ""}`}
            onClick={() => act({ type: "SETTING", key, value: !game[key] })}
          >
            <i />
          </button>
        </div>
      ))}
      <p className="save-status">
        <Icon name={saveError ? "leaf" : "check"} size={18} />
        {saveError || "Tiến trình tự lưu trên thiết bị này."}
      </p>
      <p className="quiet-note">
        Green Valley Farm · Android Alpha 0.1.0
        <br />
        Không cần mạng để chăm nông trại.
      </p>
      {confirm ? (
        <div className="reset-confirm">
          <h3>Bắt đầu lại từ ngày 1?</h3>
          <p>Xu, vật phẩm và câu chuyện trên thiết bị này sẽ được đặt lại.</p>
          <button className="danger-button" onClick={onReset}>
            Xác nhận đặt lại tiến trình
          </button>
          <button
            className="secondary-button"
            onClick={() => setConfirm(false)}
          >
            Giữ nông trại của tôi
          </button>
        </div>
      ) : (
        <button className="reset-button" onClick={() => setConfirm(true)}>
          Đặt lại tiến trình
        </button>
      )}
    </>
  );
}
