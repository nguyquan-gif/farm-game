import { useState } from 'react'

export default function FarmInteractiveDiorama({ game, onZoneClick }) {
  const [activeHover, setActiveHover] = useState(null)

  const isHarvestReady = game.plots && game.plots.some(p => p.state === 'ready')

  const zones = [
    {
      id: 'house',
      name: 'Nhà chính',
      icon: '🏠',
      badge: game.houseFixed ? '✨ Đã sửa' : '🔨 Tu sửa',
      alert: !game.houseFixed,
      // Position on the upper cottage
      top: '32%',
      left: '50%',
    },
    {
      id: 'cabbage',
      name: 'Vườn rau',
      icon: '🥬',
      badge: isHarvestReady ? '✨ Thu hoạch!' : '🌱 Đang lớn',
      alert: isHarvestReady,
      // Position on the front crop plots
      top: '63%',
      left: '46%',
    },
    {
      id: 'chicken',
      name: 'Chuồng trại',
      icon: '🐮',
      badge: game.feed >= 15 ? '🥚 Có trứng' : '🥕 Cần thức ăn',
      alert: game.feed >= 15,
      // Position on the red barn & livestock
      top: '46%',
      left: '64%',
    },
    {
      id: 'water',
      name: 'Dòng suối',
      icon: '💧',
      badge: game.waterFixed ? `${game.water}% Nước` : '⚠️ Rò rỉ',
      alert: !game.waterFixed,
      // Position on the blue stream on the left
      top: '52%',
      left: '32%',
    },
    {
      id: 'linh',
      name: 'Quán của Linh',
      icon: game.step < 6 ? '🔒' : '👩‍🍳',
      badge: game.step < 6 ? '🔒 Khóa (NV 7)' : '📦 Đơn hàng',
      alert: game.step >= 6,
      locked: game.step < 6,
      // Position on the upper right fruit orchard
      top: '36%',
      left: '70%',
    },
    {
      id: 'market',
      name: 'Phiên chợ',
      icon: game.step < 9 ? '🔒' : '🎪',
      badge: game.step < 9 ? '🔒 Khóa (NV 10)' : '🎉 Đang mở',
      alert: game.step >= 9,
      locked: game.step < 9,
      // Position on the lower right terrace
      top: '62%',
      left: '72%',
    },
  ]

  return (
    <div className="diorama-container">
      {/* ─── High-res 3D Diorama Artwork ─── */}
      <div className="diorama-artwork-wrap">
        <img
          src="/farm-diorama.png"
          alt="Green Valley Farm 3D Diorama"
          className="diorama-image"
          draggable="false"
        />

        {/* Ambient floating nature particles */}
        <div className="diorama-particles">
          <span className="particle p1">🍃</span>
          <span className="particle p2">✨</span>
          <span className="particle p3">🍃</span>
          <span className="particle p4">🌸</span>
        </div>

        {/* ─── Interactive 3D Hotspot Pins ─── */}
        {zones.map((z) => (
          <div
            key={z.id}
            className={`diorama-hotspot ${z.alert ? 'alert' : ''} ${z.locked ? 'locked' : ''} ${activeHover === z.id ? 'active' : ''}`}
            style={{ top: z.top, left: z.left }}
            onClick={() => onZoneClick(z.id)}
            onMouseEnter={() => setActiveHover(z.id)}
            onMouseLeave={() => setActiveHover(null)}
          >
            {/* Glowing ripple ring when ready */}
            {z.alert && <div className="hotspot-pulse-ring" />}

            {/* Floating 3D Pin Head */}
            <div className="hotspot-pin-bubble">
              <span className="hotspot-icon">{z.icon}</span>
              {z.alert && <span className="hotspot-notify-dot">!</span>}
            </div>

            {/* Label pill */}
            <div className="hotspot-label-pill">
              <span className="hotspot-title">{z.name}</span>
              <span className="hotspot-sub">{z.badge}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="diorama-hint-bar">
        <span>💡 Chạm vào các công trình hoặc luống rau trên đảo để thao tác</span>
      </div>
    </div>
  )
}
