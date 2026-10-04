import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import FarmInteractiveDiorama from './FarmInteractiveDiorama.jsx'

/* ═══════════════════════════════════════════════════════════════════
   AUDIO & BGM SYSTEM (Web Audio API Synthesizer)
   ═══════════════════════════════════════════════════════════════════ */
const getAudioContext = (() => {
  let ctx = null
  return () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) ctx = new AudioCtx()
    }
    if (ctx && ctx.state === 'suspended') ctx.resume()
    return ctx
  }
})()

/* ─── Cozy Country Farm BGM Sequencer ─── */
let bgmTimer = null
let currentBgmStep = 0

// Cozy Kalimba / Music Box Melody in C Major
const BGM_PATTERN = [
  // Bar 1: C
  { note: 261.63, bass: 130.81, dur: 0.35 },
  { note: 329.63, bass: null,   dur: 0.35 },
  { note: 392.00, bass: null,   dur: 0.35 },
  { note: 523.25, bass: null,   dur: 0.35 },
  // Bar 2: G
  { note: 392.00, bass: 98.00,  dur: 0.35 },
  { note: 493.88, bass: null,   dur: 0.35 },
  { note: 587.33, bass: null,   dur: 0.35 },
  { note: 493.88, bass: null,   dur: 0.35 },
  // Bar 3: Am
  { note: 440.00, bass: 110.00, dur: 0.35 },
  { note: 329.63, bass: null,   dur: 0.35 },
  { note: 523.25, bass: null,   dur: 0.35 },
  { note: 440.00, bass: null,   dur: 0.35 },
  // Bar 4: F
  { note: 349.23, bass: 87.31,  dur: 0.35 },
  { note: 440.00, bass: null,   dur: 0.35 },
  { note: 523.25, bass: null,   dur: 0.35 },
  { note: 659.25, bass: null,   dur: 0.35 },
  // Bar 5: Em
  { note: 329.63, bass: 82.41,  dur: 0.35 },
  { note: 392.00, bass: null,   dur: 0.35 },
  { note: 493.88, bass: null,   dur: 0.35 },
  { note: 392.00, bass: null,   dur: 0.35 },
  // Bar 6: Dm
  { note: 293.66, bass: 73.42,  dur: 0.35 },
  { note: 349.23, bass: null,   dur: 0.35 },
  { note: 440.00, bass: null,   dur: 0.35 },
  { note: 349.23, bass: null,   dur: 0.35 },
  // Bar 7: G7
  { note: 392.00, bass: 98.00,  dur: 0.35 },
  { note: 493.88, bass: null,   dur: 0.35 },
  { note: 349.23, bass: null,   dur: 0.35 },
  { note: 293.66, bass: null,   dur: 0.35 },
  // Bar 8: C Resolution
  { note: 261.63, bass: 130.81, dur: 0.5 },
  { note: 329.63, bass: null,   dur: 0.3 },
  { note: 392.00, bass: null,   dur: 0.3 },
  { note: 523.25, bass: null,   dur: 0.6 },
]

const playBgmStep = () => {
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return
  const step = BGM_PATTERN[currentBgmStep]
  const t = ctx.currentTime

  // 1. Kalimba-like Melody Note
  if (step.note) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(step.note, t)

    // Soft warm envelope
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.045, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + step.dur)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + step.dur)
  }

  // 2. Warm Bass Note (on downbeats)
  if (step.bass) {
    const bassOsc = ctx.createOscillator()
    const bassGain = ctx.createGain()
    bassOsc.type = 'sine'
    bassOsc.frequency.setValueAtTime(step.bass, t)

    bassGain.gain.setValueAtTime(0.001, t)
    bassGain.gain.linearRampToValueAtTime(0.035, t + 0.03)
    bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)

    bassOsc.connect(bassGain)
    bassGain.connect(ctx.destination)
    bassOsc.start(t)
    bassOsc.stop(t + 0.6)
  }

  currentBgmStep = (currentBgmStep + 1) % BGM_PATTERN.length
}

const startBgm = () => {
  if (bgmTimer) return
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') ctx.resume()
  playBgmStep()
  bgmTimer = setInterval(playBgmStep, 360) // ~104 BPM relaxing tempo
}

const stopBgm = () => {
  if (bgmTimer) {
    clearInterval(bgmTimer)
    bgmTimer = null
  }
}

const playSound = (type, enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  if (type === 'click') {
    osc.type = 'sine'
    osc.frequency.setValueAtTime(550, t)
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.08)
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    osc.start(t)
    osc.stop(t + 0.08)
  } else if (type === 'coin') {
    osc.type = 'square'
    osc.frequency.setValueAtTime(987.77, t)
    osc.frequency.setValueAtTime(1318.51, t + 0.08)
    gain.gain.setValueAtTime(0.04, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.start(t)
    osc.stop(t + 0.2)
  } else if (type === 'harvest') {
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(350, t)
    osc.frequency.linearRampToValueAtTime(700, t + 0.15)
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    osc.start(t)
    osc.stop(t + 0.15)
  } else if (type === 'levelup') {
    osc.type = 'triangle'
    const notes = [440, 554.37, 659.25, 880]
    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + i * 0.08)
    })
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.linearRampToValueAtTime(0.001, t + 0.4)
    osc.start(t)
    osc.stop(t + 0.4)
  } else if (type === 'sleep') {
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, t)
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.3)
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.linearRampToValueAtTime(0.001, t + 0.3)
    osc.start(t)
    osc.stop(t + 0.3)
  } else if (type === 'error') {
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(160, t)
    osc.frequency.linearRampToValueAtTime(110, t + 0.18)
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.linearRampToValueAtTime(0.001, t + 0.18)
    osc.start(t)
    osc.stop(t + 0.18)
  }
}

/* ═══════════════════════════════════════════════════════════════════
   GAME DATA & STORYLINE
   ═══════════════════════════════════════════════════════════════════ */
const MISSIONS = [
  { id: 0, title: 'Mảnh đất thức giấc', desc: 'Thu hoạch luống rau đầu tiên tại Vườn rau.', target: 'cabbage' },
  { id: 1, title: 'Một chiếc giỏ rau', desc: 'Gieo hạt và thu hoạch thêm 3 bó rau xanh.', target: 'cabbage' },
  { id: 2, title: 'Dòng nước bí ẩn', desc: 'Sửa chữa bể nước rò rỉ để cứu hạn cây trồng.', target: 'water' },
  { id: 3, title: 'Bữa ăn đàn gà', desc: 'Cho đàn gà ăn no để chúng đẻ trứng tươi.', target: 'chicken' },
  { id: 4, title: 'Sửa sang mái nhà', desc: 'Tu sửa Nhà chính để có nơi che mưa che nắng.', target: 'house' },
  { id: 5, title: 'Kỷ vật của ông', desc: 'Tìm thấy cuốn nhật ký nông trại trong nhà.', target: 'house' },
  { id: 6, title: 'Đơn hàng của Linh', desc: 'Giao 3 rau + 1 trứng cho Quán Linh.', target: 'linh' },
  { id: 7, title: 'Mở rộng diện tích', desc: 'Mua thêm luống đất thứ 2 để trồng trọt.', target: 'cabbage' },
  { id: 8, title: 'Đàn bò thung lũng', desc: 'Mua bò sữa đầu tiên cho trang trại.', target: 'chicken' },
  { id: 9, title: 'Phiên chợ đầu tiên', desc: 'Tham gia bán hàng tại Phiên Chợ Thung Lũng.', target: 'market' },
  { id: 10, title: 'Nông trang danh tiếng', desc: 'Đạt 100 điểm danh tiếng với cư dân.', target: 'market' },
  { id: 11, title: 'Giấc mơ hoàn thành', desc: 'Biến Green Valley thành trang trại trù phú nhất!', target: 'house' },
]

const IAP_PACKAGES = [
  { id: 'gem_small', name: 'Túi 50 Kim Cương', gems: 50, price: '25.000 đ', icon: '💎', bonus: null },
  { id: 'gem_med', name: 'Rương 300 Kim Cương', gems: 300, price: '99.000 đ', icon: '💍', bonus: '+30 💎 Thưởng' },
  { id: 'gem_large', name: 'Kho Báu 1.000 Kim Cương', gems: 1000, price: '249.000 đ', icon: '👑', bonus: '+200 💎 Siêu hời' },
]

const INITIAL_STATE = {
  coins: 80,
  gems: 5,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  xp: 15,
  step: 0,
  day: 1,
  soundOn: true,
  // Farm resources
  seeds: 4,
  veg: 0,
  water: 50,
  waterFixed: false,
  feed: 60,
  eggs: 0,
  milk: 0,
  chickens: 2,
  cows: 0,
  houseFixed: false,
  reputation: 10,
  // Fields (up to 3 plots)
  plots: [
    { id: 1, state: 'ready' }, // ready | empty | growing
    { id: 2, state: 'empty' },
  ],
  logs: ['Chào mừng bạn đến với Green Valley Farm!'],
}

const SAVE_KEY = 'green_valley_v4_save'

function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) return { ...INITIAL_STATE, ...JSON.parse(raw) }
  } catch (e) {}
  return INITIAL_STATE
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [game, setGame] = useState(loadSavedGame)
  const [activeTab, setActiveTab] = useState('farm') // farm | shop | story
  const [activeModal, setActiveModal] = useState(null) // cabbage | chicken | water | house | linh | market | settings
  const [toast, setToast] = useState(null)
  const [simulatedCheckout, setSimulatedCheckout] = useState(null)
  const [bgmActive, setBgmActive] = useState(false)

  // Auto-start BGM on first user tap/click (bypasses browser autoplay policy)
  useEffect(() => {
    const handleFirstTouch = () => {
      startBgm()
      setBgmActive(true)
      window.removeEventListener('click', handleFirstTouch)
      window.removeEventListener('touchstart', handleFirstTouch)
    }
    window.addEventListener('click', handleFirstTouch)
    window.addEventListener('touchstart', handleFirstTouch)
    return () => {
      window.removeEventListener('click', handleFirstTouch)
      window.removeEventListener('touchstart', handleFirstTouch)
    }
  }, [])

  const toggleBgm = useCallback(() => {
    if (bgmActive) {
      stopBgm()
      setBgmActive(false)
      setToast({ msg: '🔇 Đã tắt nhạc nền', type: 'normal' })
    } else {
      startBgm()
      setBgmActive(true)
      setToast({ msg: '🎵 Đang phát nhạc nền Thung Lũng Xanh!', type: 'normal' })
    }
  }, [bgmActive])

  // Auto-save
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game))
  }, [game])

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(id)
  }, [toast])

  const notify = useCallback((msg, type = 'normal') => {
    setToast({ msg, type })
    if (type === 'error') playSound('error', game.soundOn)
  }, [game.soundOn])

  const sfx = useCallback((type) => {
    playSound(type, game.soundOn)
  }, [game.soundOn])

  const update = useCallback((patch, logMsg) => {
    setGame(prev => ({
      ...prev,
      ...patch,
      logs: logMsg ? [logMsg, ...prev.logs].slice(0, 20) : prev.logs
    }))
  }, [])

  const gainXp = useCallback((amount) => {
    setGame(prev => {
      const nextXp = prev.xp + amount
      if (nextXp >= 100) {
        playSound('levelup', prev.soundOn)
        return {
          ...prev,
          xp: nextXp - 100,
          level: prev.level + 1,
          gems: prev.gems + 2,
          coins: prev.coins + 50,
          maxEnergy: prev.maxEnergy + 10,
          energy: prev.maxEnergy + 10,
        }
      }
      return { ...prev, xp: nextXp }
    })
  }, [])

  const spendEnergy = useCallback((cost) => {
    if (game.energy < cost) {
      notify('Không đủ năng lượng! Hãy nghỉ ngơi hoặc nạp thêm.', 'error')
      return false
    }
    update({ energy: game.energy - cost })
    return true
  }, [game.energy, notify, update])

  const currentMission = useMemo(() => {
    return MISSIONS[Math.min(game.step, MISSIONS.length - 1)]
  }, [game.step])

  /* ─── FARM ACTIONS ─── */
  const handlePlant = (plotId) => {
    if (game.seeds <= 0) return notify('Bạn đã hết hạt giống! Mua thêm ở Cửa hàng.', 'error')
    if (!spendEnergy(8)) return
    sfx('click')
    const updatedPlots = game.plots.map(p => p.id === plotId ? { ...p, state: 'growing' } : p)
    update({ plots: updatedPlots, seeds: game.seeds - 1 }, 'Đã gieo hạt giống vào luống đất.')
    notify('🌱 Đã gieo hạt giống!')
    gainXp(5)
  }

  const handleWater = (plotId) => {
    if (game.water < 10) return notify('Bể nước đã cạn! Hãy bổ sung nước.', 'error')
    if (!spendEnergy(5)) return
    sfx('harvest')
    const updatedPlots = game.plots.map(p => p.id === plotId ? { ...p, state: 'ready' } : p)
    update({ plots: updatedPlots, water: game.water - 10 }, 'Đã tưới nước cho luống rau.')
    notify('💧 Đã tưới nước, rau lớn nhanh thật!')
    gainXp(5)
  }

  const handleHarvest = (plotId) => {
    if (!spendEnergy(8)) return
    sfx('harvest')
    const updatedPlots = game.plots.map(p => p.id === plotId ? { ...p, state: 'empty' } : p)
    const yieldAmount = 3
    const coinReward = 12
    update({
      plots: updatedPlots,
      veg: game.veg + yieldAmount,
      coins: game.coins + coinReward
    }, `Thu hoạch được ${yieldAmount} bó rau xanh (+${coinReward} xu).`)
    notify(`🥬 Thu hoạch +${yieldAmount} rau, nhận +${coinReward} xu!`)
    gainXp(12)

    // Progress mission 0 or 1
    if (game.step === 0) update({ step: 1 })
    else if (game.step === 1 && game.veg + yieldAmount >= 3) update({ step: 2 })
  }

  const handleFixWater = () => {
    if (game.waterFixed) return notify('Bể nước đã được sửa hoàn chỉnh!')
    if (game.coins < 40) return notify('Bạn cần 40 xu để mua phụ tùng sửa bể.', 'error')
    sfx('coin')
    update({
      coins: game.coins - 40,
      water: 100,
      waterFixed: true,
      reputation: game.reputation + 10
    }, 'Bình (thợ sửa) đã sửa xong đường ống bể nước!')
    notify('🔧 Đã sửa xong bể nước! Bể chứa đầy 100% 💧')
    gainXp(25)
    if (game.step === 2) update({ step: 3 })
  }

  const handleFeedChickens = () => {
    if (game.feed < 15) return notify('Hết thức ăn cho gà! Mua thêm ở Cửa hàng.', 'error')
    if (!spendEnergy(5)) return
    sfx('click')
    const eggsGot = game.chickens
    update({
      feed: game.feed - 15,
      eggs: game.eggs + eggsGot,
    }, `Đã cho đàn gà ăn, nhặt được ${eggsGot} quả trứng.`)
    notify(`🐔 Gà ăn no và đẻ được ${eggsGot} trứng tươi! 🥚`)
    gainXp(8)
    if (game.step === 3) update({ step: 4 })
  }

  const handleFixHouse = () => {
    if (game.houseFixed) return notify('Ngôi nhà đã khang trang rồi!')
    if (game.coins < 80) return notify('Cần 80 xu để mua gỗ và ngói tu sửa nhà.', 'error')
    sfx('coin')
    update({
      coins: game.coins - 80,
      houseFixed: true,
      reputation: game.reputation + 25
    }, 'Ngôi nhà chính đã được tu sửa ấm cúng và sáng đèn!')
    notify('🏠 Ngôi nhà đã tu sửa xong! Bạn tìm thấy nhật ký của ông nội ✨')
    gainXp(35)
    if (game.step === 4) update({ step: 5 })
    else if (game.step === 5) update({ step: 6 })
  }

  const handleDeliverLinh = () => {
    if (game.veg < 3 || game.eggs < 1) {
      return notify('Đơn hàng cần 3 rau xanh và 1 quả trứng tươi.', 'error')
    }
    sfx('coin')
    const rewardCoins = 65
    const rewardGems = 1
    update({
      veg: game.veg - 3,
      eggs: game.eggs - 1,
      coins: game.coins + rewardCoins,
      gems: game.gems + rewardGems,
      reputation: game.reputation + 15
    }, `Giao hàng thành công cho Linh (+${rewardCoins} xu, +${rewardGems} kim cương).`)
    notify(`👩‍🍳 Giao hàng thành công! +${rewardCoins} xu, +${rewardGems} 💎`)
    gainXp(30)
    if (game.step === 6) update({ step: 7 })
  }

  const handleMarketTrade = () => {
    if (game.veg < 2 && game.eggs < 1) {
      return notify('Bạn cần có ít nhất 2 rau hoặc 1 trứng để mở sạp bán.', 'error')
    }
    sfx('coin')
    const vegSold = Math.min(game.veg, 4)
    const eggsSold = Math.min(game.eggs, 2)
    const profit = vegSold * 15 + eggsSold * 22
    update({
      veg: game.veg - vegSold,
      eggs: game.eggs - eggsSold,
      coins: game.coins + profit,
      reputation: game.reputation + 20
    }, `Phiên chợ đắt khách! Bán được nông sản thu về ${profit} xu.`)
    notify(`🎪 Phiên chợ kết thúc thắng lợi! Kiếm được +${profit} xu 🪙`)
    gainXp(25)
    if (game.step === 9) update({ step: 10 })
  }

  const handleNextDay = () => {
    sfx('sleep')
    // Crops grow overnight
    const grownPlots = game.plots.map(p => p.state === 'growing' ? { ...p, state: 'ready' } : p)
    update({
      day: game.day + 1,
      energy: game.maxEnergy,
      plots: grownPlots,
      water: Math.min(100, game.water + 15) // night dew / light rain
    }, `Chào ngày mới thứ ${game.day + 1}! Năng lượng hồi phục đầy đủ.`)
    notify(`🌅 Ngày ${game.day + 1} bắt đầu! Cây cối đã lớn thêm 🌾`)
  }

  const handleWatchAd = () => {
    sfx('click')
    notify('📺 Đang xem quảng cáo quà tặng (mô phỏng)...')
    setTimeout(() => {
      sfx('coin')
      update({
        energy: Math.min(game.maxEnergy, game.energy + 35),
        coins: game.coins + 50
      }, 'Xem quảng cáo nhận quà: +35 năng lượng, +50 xu.')
      notify('🎁 Quà quảng cáo: Nhận ngay +35 ⚡ và +50 🪙!')
    }, 1200)
  }

  const handleBuyIap = (pkg) => {
    sfx('click')
    setSimulatedCheckout(pkg)
  }

  const confirmCheckout = () => {
    if (!simulatedCheckout) return
    sfx('coin')
    const bonus = simulatedCheckout.bonus ? 30 : 0
    update({
      gems: game.gems + simulatedCheckout.gems + bonus,
    }, `Nạp thành công gói ${simulatedCheckout.name}!`)
    notify(`🎉 Thanh toán thành công! Nhận +${simulatedCheckout.gems} 💎`)
    setSimulatedCheckout(null)
  }

  const handleZoneClick = (zoneId) => {
    sfx('click')
    if (zoneId === 'linh' && game.step < 6) {
      notify('Quán Linh chưa mở! Hãy hoàn thành nhiệm vụ "Kỷ vật của ông" (NV 6).', 'error')
      return
    }
    if (zoneId === 'market' && game.step < 9) {
      notify('Phiên chợ chỉ mở khi bạn đạt nhiệm vụ 10 ("Phiên chợ đầu tiên")!', 'error')
      return
    }
    setActiveModal(zoneId)
  }

  return (
    <div className="app-container">
      {/* ─── HEADER ─── */}
      <header className="game-header">
        <div className="header-top">
          <div className="player-badge">
            <div className="level-star">L{game.level}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>Nông trại Xanh</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Ngày {game.day} · ☀️ Nắng ấm</span>
            </div>
          </div>
          <div className="header-currencies">
            <button
              onClick={toggleBgm}
              className="currency-pill"
              style={{
                cursor: 'pointer',
                border: bgmActive ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
                background: bgmActive ? '#f0fdf4' : '#f8fafc',
                color: bgmActive ? '#15803d' : '#64748b'
              }}
              title={bgmActive ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            >
              <span className="currency-icon">{bgmActive ? '🎵' : '🔇'}</span>
              <span style={{ fontSize: '11px', fontWeight: '900' }}>{bgmActive ? 'Nhạc: Bật' : 'Nhạc: Tắt'}</span>
            </button>
            <div className="currency-pill">
              <span className="currency-icon">🪙</span>
              <span>{game.coins}</span>
            </div>
            <div className="currency-pill">
              <span className="currency-icon">💎</span>
              <span style={{ color: '#9333ea' }}>{game.gems}</span>
            </div>
          </div>
        </div>

        {/* Energy and XP Progress Bars */}
        <div className="header-bars">
          <div className="bar-wrapper">
            <span className="bar-icon">⚡</span>
            <div className="bar-track">
              <div
                className="bar-fill energy"
                style={{ width: `${Math.min(100, (game.energy / game.maxEnergy) * 100)}%` }}
              />
            </div>
            <span className="bar-label">{game.energy}/{game.maxEnergy}</span>
          </div>
          <div className="bar-wrapper">
            <span className="bar-icon">⭐</span>
            <div className="bar-track">
              <div
                className="bar-fill xp"
                style={{ width: `${Math.min(100, game.xp)}%` }}
              />
            </div>
            <span className="bar-label">{game.xp}/100</span>
          </div>
        </div>
      </header>

      {/* ─── QUEST BANNER ─── */}
      <div className="quest-banner" onClick={() => handleZoneClick(currentMission.target)}>
        <div className="quest-scroll-icon">📜</div>
        <div className="quest-details">
          <div className="quest-step-tag">Mục tiêu #{Math.min(game.step + 1, 12)} / 12</div>
          <div className="quest-title">{currentMission.title}</div>
          <div className="quest-desc">{currentMission.desc}</div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '900', color: '#ca8a04' }}>Làm ngay ➔</span>
      </div>

      {/* ─── VIEWPORT ─── */}
      <main className="main-viewport">
        {/* TAB 1: COZY 3D FARM MAP */}
        {activeTab === 'farm' && (
          <div className="farm-map-wrapper">
            <div className="farm-scenery" />
            <div className="farm-dirt-paths" />

            {/* GORGEOUS 3D DIORAMA ISLAND ARTWORK & HOTSPOTS */}
            <FarmInteractiveDiorama game={game} onZoneClick={handleZoneClick} />

            <div className="farm-grid">
              {/* 1. VƯỜN RAU */}
              <div className="farm-zone-card zone-cabbage" onClick={() => handleZoneClick('cabbage')}>
                {game.plots.some(p => p.state === 'ready') && <div className="zone-alert-badge">!</div>}
                <div className="zone-graphic-wrap">🥬</div>
                <div className="zone-name">Vườn rau</div>
                <div className={`zone-status-pill ${game.plots.some(p => p.state === 'ready') ? 'ready' : ''}`}>
                  {game.plots.some(p => p.state === 'ready') ? '✨ Thu hoạch ngay!' :
                   game.plots.some(p => p.state === 'growing') ? '🌱 Đang lớn (Tưới)' : '🟫 Cần gieo hạt'}
                </div>
              </div>

              {/* 2. CHUỒNG GÀ */}
              <div className="farm-zone-card zone-chicken" onClick={() => handleZoneClick('chicken')}>
                <div className="zone-graphic-wrap">🐔</div>
                <div className="zone-name">Chuồng trại</div>
                <div className="zone-status-pill">
                  {game.feed >= 15 ? `🥚 Có trứng tươi` : '🥕 Cần thức ăn'}
                </div>
              </div>

              {/* 3. BỂ NƯỚC */}
              <div className="farm-zone-card zone-water" onClick={() => handleZoneClick('water')}>
                {!game.waterFixed && <div className="zone-alert-badge">!</div>}
                <div className="zone-graphic-wrap">💧</div>
                <div className="zone-name">Bể chứa nước</div>
                <div className={`zone-status-pill ${!game.waterFixed ? 'urgent' : ''}`}>
                  {game.waterFixed ? `💧 ${game.water}% Nước` : '⚠️ Đường ống rò rỉ'}
                </div>
              </div>

              {/* 4. NHÀ CHÍNH */}
              <div className="farm-zone-card zone-house" onClick={() => handleZoneClick('house')}>
                {!game.houseFixed && <div className="zone-alert-badge">!</div>}
                <div className="zone-graphic-wrap">🏠</div>
                <div className="zone-name">Nhà chính</div>
                <div className="zone-status-pill">
                  {game.houseFixed ? '✨ Đã tu sửa ấm cúng' : '🔨 Cần sửa chữa'}
                </div>
              </div>

              {/* 5. QUÁN LINH (LOCKED IF STEP < 6) */}
              <div
                className={`farm-zone-card zone-linh ${game.step < 6 ? 'locked' : ''}`}
                onClick={() => handleZoneClick('linh')}
              >
                <div className="zone-graphic-wrap">{game.step < 6 ? '🔒' : '👩‍🍳'}</div>
                <div className="zone-name">Quán của Linh</div>
                <div className={`zone-status-pill ${game.step < 6 ? 'locked-tag' : 'ready'}`}>
                  {game.step < 6 ? '🔒 Mở ở Nhiệm vụ 7' : '📦 Đang nhận đơn'}
                </div>
              </div>

              {/* 6. PHIÊN CHỢ (LOCKED IF STEP < 9) */}
              <div
                className={`farm-zone-card zone-market ${game.step < 9 ? 'locked' : ''}`}
                onClick={() => handleZoneClick('market')}
              >
                <div className="zone-graphic-wrap">{game.step < 9 ? '🔒' : '🎪'}</div>
                <div className="zone-name">Phiên chợ</div>
                <div className={`zone-status-pill ${game.step < 9 ? 'locked-tag' : 'ready'}`}>
                  {game.step < 9 ? '🔒 Mở ở Nhiệm vụ 10' : '🎉 Đang họp chợ'}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Sleep to pass day */}
            <div className="farm-action-bar">
              <button className="sleep-button" onClick={handleNextDay}>
                <span>🌙</span>
                <span>Đi ngủ (Bắt đầu ngày mới)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SHOP WITH IN-APP PURCHASES & ADS */}
        {activeTab === 'shop' && (
          <ShopScreen
            game={game}
            update={update}
            sfx={sfx}
            notify={notify}
            onBuyIap={handleBuyIap}
            onWatchAd={handleWatchAd}
          />
        )}

        {/* TAB 3: STORY & QUEST JOURNAL */}
        {activeTab === 'story' && (
          <StoryScreen game={game} />
        )}
      </main>

      {/* ─── BOTTOM NAVIGATION ─── */}
      <nav className="bottom-nav-bar">
        <button
          className={`nav-tab-btn ${activeTab === 'farm' ? 'active' : ''}`}
          onClick={() => { sfx('click'); setActiveTab('farm') }}
        >
          <span className="nav-tab-icon">🏡</span>
          <span className="nav-tab-label">Trang trại</span>
          {activeTab === 'farm' && <span className="nav-active-dot" />}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => { sfx('click'); setActiveTab('shop') }}
        >
          <span className="nav-tab-icon">🛒</span>
          <span className="nav-tab-label">Cửa hàng</span>
          {activeTab === 'shop' && <span className="nav-active-dot" />}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => { sfx('click'); setActiveTab('story') }}
        >
          <span className="nav-tab-icon">📖</span>
          <span className="nav-tab-label">Nhiệm vụ</span>
          {activeTab === 'story' && <span className="nav-active-dot" />}
        </button>
      </nav>

      {/* ─── POPUP PANELS ─── */}
      {activeModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-dialog">
            <div className="modal-header-bar">
              <h2 className="modal-heading">
                {activeModal === 'cabbage' && '🥬 Vườn rau thung lũng'}
                {activeModal === 'chicken' && '🐔 Chuồng trại gia cầm'}
                {activeModal === 'water' && '💧 Bể chứa nước cổ'}
                {activeModal === 'house' && '🏠 Nhà chính thung lũng'}
                {activeModal === 'linh' && '👩‍🍳 Quán ăn của Linh'}
                {activeModal === 'market' && '🎪 Phiên chợ Green Valley'}
              </h2>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="modal-scroll-body">
              {/* 1. CABBAGE / FIELD PANEL */}
              {activeModal === 'cabbage' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '12px', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>🌱 Túi hạt giống: <b>{game.seeds} gói</b></span>
                    <button
                      className="game-btn primary"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => { setActiveModal(null); setActiveTab('shop') }}
                    >
                      + Mua hạt
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {game.plots.map(plot => (
                      <div key={plot.id} className="crop-plot-card">
                        <div className="crop-preview">
                          <div className="crop-icon-large">
                            {plot.state === 'ready' ? '🥬' : plot.state === 'growing' ? '🌱' : '🟫'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '900', fontSize: '14px' }}>Luống đất #{plot.id}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {plot.state === 'ready' ? 'Rau đã tươi tốt, thu hoạch ngay!' :
                               plot.state === 'growing' ? 'Cây con đang khát nước' : 'Đất tơi xốp, sẵn sàng gieo'}
                            </div>
                          </div>
                        </div>

                        <div>
                          {plot.state === 'empty' && (
                            <button className="game-btn primary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => handlePlant(plot.id)}>
                              Gieo (8⚡)
                            </button>
                          )}
                          {plot.state === 'growing' && (
                            <button className="game-btn blue" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => handleWater(plot.id)}>
                              Tưới (5⚡)
                            </button>
                          )}
                          {plot.state === 'ready' && (
                            <button className="game-btn gold" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => handleHarvest(plot.id)}>
                              Thu hoạch (8⚡)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {game.plots.length < 3 && (
                    <button
                      className="game-btn"
                      style={{ background: '#f1f5f9', color: '#475569', border: '2px dashed #cbd5e1', boxShadow: 'none' }}
                      onClick={() => {
                        if (game.coins >= 70) {
                          sfx('coin')
                          update({
                            coins: game.coins - 70,
                            plots: [...game.plots, { id: game.plots.length + 1, state: 'empty' }]
                          }, 'Đã khai hoang thêm một luống rau mới!')
                          notify('🌾 Đã mở thêm luống đất mới!')
                        } else {
                          notify('Cần 70 xu để khai hoang thêm luống đất mới!', 'error')
                        }
                      }}
                    >
                      + Khai hoang thêm luống #{game.plots.length + 1} (70 🪙)
                    </button>
                  )}
                </>
              )}

              {/* 2. CHICKEN / BARN PANEL */}
              {activeModal === 'chicken' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '26px' }}>🐔</div>
                      <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '800' }}>Đàn gà</div>
                      <div style={{ fontSize: '16px', fontWeight: '900' }}>{game.chickens} con</div>
                    </div>
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', padding: '12px', borderRadius: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '26px' }}>🥚</div>
                      <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '800' }}>Trứng trong kho</div>
                      <div style={{ fontSize: '16px', fontWeight: '900' }}>{game.eggs} quả</div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '800' }}>
                      <span>Máng thức ăn cho gà:</span>
                      <span>{game.feed}%</span>
                    </div>
                    <div className="bar-track" style={{ height: '12px' }}>
                      <div className="bar-fill energy" style={{ width: `${game.feed}%` }} />
                    </div>
                  </div>

                  <button className="game-btn gold" onClick={handleFeedChickens}>
                    🥕 Cho gà ăn & Nhặt trứng (5⚡)
                  </button>
                </>
              )}

              {/* 3. WATER TANK PANEL */}
              {activeModal === 'water' && (
                <>
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '50px', marginBottom: '8px' }}>💧</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Dung tích bể nước</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Nước dùng để tưới rau hàng ngày giúp rau tươi tốt mau lớn.
                    </p>
                  </div>

                  <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '16px', border: '2px solid #bae6fd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '800', fontSize: '13px' }}>
                      <span>Mực nước hiện tại:</span>
                      <span style={{ color: '#0284c7' }}>{game.water} / 100%</span>
                    </div>
                    <div className="bar-track" style={{ height: '14px' }}>
                      <div className="bar-fill" style={{ background: 'linear-gradient(90deg, #38bdf8, #0284c7)', width: `${game.water}%` }} />
                    </div>
                  </div>

                  {!game.waterFixed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', color: '#991b1b', fontSize: '12px' }}>
                        ⚠️ <b>Cảnh báo:</b> Ống nước ngầm bị nứt làm rò rỉ nước mỗi đêm. Hãy sửa ngay!
                      </div>
                      <button className="game-btn primary" onClick={handleFixWater}>
                        🔧 Sửa đường ống nước (40 🪙)
                      </button>
                    </div>
                  ) : (
                    <button
                      className="game-btn blue"
                      onClick={() => {
                        if (game.coins >= 15) {
                          sfx('coin')
                          update({ coins: game.coins - 15, water: Math.min(100, game.water + 30) }, 'Đã mua thêm nước sạch dự trữ.')
                          notify('💧 Bể đã được bơm đầy thêm 30%!')
                        } else {
                          notify('Không đủ xu để bơm nước (cần 15 xu)', 'error')
                        }
                      }}
                    >
                      🪣 Bơm thêm 30% nước sạch (15 🪙)
                    </button>
                  )}
                </>
              )}

              {/* 4. HOUSE PANEL */}
              {activeModal === 'house' && (
                <>
                  <div style={{ textAlign: 'center', padding: '6px 0' }}>
                    <div style={{ fontSize: '50px', marginBottom: '8px' }}>🏡</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Nhà chính Thung lũng</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Ngôi nhà tổ tiên để lại giữa thung lũng trù phú.
                    </p>
                  </div>

                  {game.houseFixed ? (
                    <div style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', padding: '16px', borderRadius: '16px' }}>
                      <b style={{ color: '#a21caf', fontSize: '14px' }}>📖 Nhật ký của Ông Nội:</b>
                      <p style={{ fontSize: '13px', color: '#4a044e', lineHeight: '1.5', marginTop: '6px', fontStyle: 'italic' }}>
                        "Mảnh đất Green Valley này có linh hồn. Cứ chăm chỉ tưới tắm và đối đãi tử tế với xóm giềng, đất sẽ trả lại cho con những mùa màng bội thu nhất..."
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px', fontSize: '13px', color: '#92400e' }}>
                        Mái nhà dột nát sau nhiều năm bỏ hoang. Hãy tu sửa để bắt đầu những ngày tháng mới ấm áp!
                      </div>
                      <button className="game-btn gold" onClick={handleFixHouse}>
                        🔨 Tu sửa nhà chính (80 🪙)
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 5. LINH CAFE PANEL */}
              {activeModal === 'linh' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#faf5ff', padding: '14px', borderRadius: '16px', border: '1.5px solid #e9d5ff' }}>
                    <div style={{ fontSize: '38px' }}>👩‍🍳</div>
                    <div>
                      <b style={{ fontSize: '15px', color: '#581c87' }}>Linh - Đầu bếp thị trấn</b>
                      <p style={{ fontSize: '12px', color: '#7e22ce', marginTop: '2px' }}>
                        "Chào bạn! Quán tớ luôn cần rau tươi và trứng sạch mỗi ngày để nấu món ngon phục vụ khách."
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                    <div style={{ fontWeight: '900', fontSize: '14px', marginBottom: '10px' }}>Đơn hàng trong ngày:</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span>🥬 Rau xanh yêu cầu:</span>
                      <b>{game.veg} / 3 bó</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                      <span>🥚 Trứng tươi yêu cầu:</span>
                      <b>{game.eggs} / 1 quả</b>
                    </div>
                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '900', color: '#16a34a' }}>
                      <span>Phần thưởng:</span>
                      <span>+65 🪙 Xu & +1 💎 Kim Cương</span>
                    </div>
                  </div>

                  <button className="game-btn primary" onClick={handleDeliverLinh}>
                    📦 Giao hàng cho Linh
                  </button>
                </>
              )}

              {/* 6. MARKET PANEL */}
              {activeModal === 'market' && (
                <>
                  <div style={{ textAlign: 'center', padding: '6px 0' }}>
                    <div style={{ fontSize: '46px', marginBottom: '6px' }}>🎪</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Phiên Chợ Green Valley</h3>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                      Nơi giao thương sầm uất, bán buôn nông sản được giá cao nhất thung lũng!
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Rau có thể bán</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>🥬 {game.veg} bó</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Trứng có thể bán</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>🥚 {game.eggs} quả</div>
                    </div>
                  </div>

                  <button className="game-btn gold" onClick={handleMarketTrade}>
                    🤝 Mở sạp bán nông sản hôm nay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SIMULATED CHECKOUT MODAL (MONETIZATION) ─── */}
      {simulatedCheckout && (
        <div className="modal-backdrop" onClick={() => setSimulatedCheckout(null)}>
          <div className="modal-dialog" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>💳</div>
              <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Xác nhận thanh toán In-App</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Cổng thanh toán Google Play / Momo (Mô phỏng thử nghiệm)
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', margin: '16px 0', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Vật phẩm:</span>
                <b>{simulatedCheckout.name}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: '#2563eb' }}>
                <span>Số tiền:</span>
                <span>{simulatedCheckout.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="game-btn primary" onClick={confirmCheckout}>
                Xác nhận Mua
              </button>
              <button className="game-btn" style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setSimulatedCheckout(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className="toast-anchor">
          <div className={`toast-pill ${toast.type}`}>
            <span>{toast.type === 'error' ? '❌' : '✨'}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-SCREENS: SHOP & STORY
   ═══════════════════════════════════════════════════════════════════ */
function ShopScreen({ game, update, sfx, notify, onBuyIap, onWatchAd }) {
  const [shopTab, setShopTab] = useState('items') // items | gems | gold

  const buySeeds = () => {
    if (game.coins < 15) return notify('Không đủ xu để mua hạt giống (cần 15 xu)', 'error')
    sfx('coin')
    update({ coins: game.coins - 15, seeds: game.seeds + 3 }, 'Đã mua thêm 3 gói hạt giống rau.')
    notify('🌱 Mua thành công 3 gói hạt giống!')
  }

  const buyFeed = () => {
    if (game.coins < 20) return notify('Không đủ xu để mua thức ăn (cần 20 xu)', 'error')
    sfx('coin')
    update({ coins: game.coins - 20, feed: Math.min(100, game.feed + 40) }, 'Đã bổ sung 40% thức ăn gà.')
    notify('🥕 Mua thức ăn thành công! Máng ăn đầy hơn.')
  }

  const exchangeGemToGold = () => {
    if (game.gems < 5) return notify('Bạn cần có ít nhất 5 Kim Cương để đổi vàng!', 'error')
    sfx('coin')
    update({ gems: game.gems - 5, coins: game.coins + 250 }, 'Đã đổi 5 Kim Cương thành 250 Xu.')
    notify('🪙 Đổi thành công: +250 Xu!')
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* AD REWARD BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '18px',
          padding: '16px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 6px 16px rgba(217, 119, 6, 0.3)',
          cursor: 'pointer'
        }}
        onClick={onWatchAd}
      >
        <div style={{ fontSize: '36px' }}>📺</div>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: '15px' }}>Xem quảng cáo nhận thưởng</b>
          <p style={{ fontSize: '11px', opacity: 0.95, marginTop: '2px' }}>
            Nhận ngay <b>+35 ⚡ Năng lượng</b> và <b>+50 🪙 Xu</b> miễn phí!
          </p>
        </div>
        <button style={{ background: '#fff', color: '#b45309', border: 'none', padding: '6px 12px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' }}>
          Xem ngay
        </button>
      </div>

      {/* TABS */}
      <div className="shop-tabs-row">
        <button
          className={`shop-tab-item ${shopTab === 'items' ? 'active' : ''}`}
          onClick={() => { sfx('click'); setShopTab('items') }}
        >
          🌾 Vật phẩm
        </button>
        <button
          className={`shop-tab-item ${shopTab === 'gems' ? 'active' : ''}`}
          onClick={() => { sfx('click'); setShopTab('gems') }}
        >
          💎 Nạp Thẻ (IAP)
        </button>
        <button
          className={`shop-tab-item ${shopTab === 'gold' ? 'active' : ''}`}
          onClick={() => { sfx('click'); setShopTab('gold') }}
        >
          🪙 Đổi Vàng
        </button>
      </div>

      {/* TAB 1: BASIC FARM ITEMS */}
      {shopTab === 'items' && (
        <div className="shop-items-grid">
          <div className="shop-item-card">
            <div style={{ fontSize: '38px', marginBottom: '6px' }}>🌱</div>
            <b style={{ fontSize: '14px' }}>Hạt rau (x3)</b>
            <span style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 10px' }}>Trồng tại luống rau</span>
            <button className="game-btn primary" style={{ padding: '8px', fontSize: '12px' }} onClick={buySeeds}>
              15 🪙
            </button>
          </div>

          <div className="shop-item-card">
            <div style={{ fontSize: '38px', marginBottom: '6px' }}>🥕</div>
            <b style={{ fontSize: '14px' }}>Thức ăn gà</b>
            <span style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 10px' }}>Hồi phục 40% máng</span>
            <button className="game-btn primary" style={{ padding: '8px', fontSize: '12px' }} onClick={buyFeed}>
              20 🪙
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: IN-APP PURCHASES */}
      {shopTab === 'gems' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Nạp kim cương để mua vật phẩm cao cấp và đẩy nhanh tiến độ nông trại.
          </div>

          {IAP_PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`shop-item-card ${pkg.bonus ? 'featured' : ''}`}
              style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '14px 16px', alignItems: 'center' }}
            >
              {pkg.bonus && <div className="shop-badge-bonus">{pkg.bonus}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>{pkg.icon}</div>
                <div style={{ textAlign: 'left' }}>
                  <b style={{ fontSize: '14px', color: '#1e293b' }}>{pkg.name}</b>
                  <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '800' }}>+{pkg.gems} Kim Cương</div>
                </div>
              </div>
              <button
                className="game-btn gold"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                onClick={() => onBuyIap(pkg)}
              >
                {pkg.price}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: EXCHANGE GEMS TO GOLD */}
      {shopTab === 'gold' && (
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', textAlign: 'center', border: '2px solid #e2e8f0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💎 ➔ 🪙</div>
          <h3 style={{ fontSize: '16px', fontWeight: '900' }}>Quy đổi Kim Cương sang Tiền Xu</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>
            Tỷ lệ quy đổi: <b>5 Kim Cương = 250 Xu</b>
          </p>
          <button className="game-btn primary" onClick={exchangeGemToGold}>
            Đổi ngay (5 💎 ➔ 250 🪙)
          </button>
        </div>
      )}
    </div>
  )
}

function StoryScreen({ game }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '16px', border: '2px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '4px' }}>📖 Cuốn Nhật Ký Thung Lũng</h3>
        <p style={{ fontSize: '12px', color: '#64748b' }}>
          Tiến trình hồi sinh trang trại qua từng cột mốc nhiệm vụ.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MISSIONS.map((m, idx) => {
          const isDone = idx < game.step
          const isCurrent = idx === game.step
          return (
            <div
              key={m.id}
              style={{
                background: isCurrent ? '#fefce8' : isDone ? '#f0fdf4' : '#f8fafc',
                border: `2px solid ${isCurrent ? '#facc15' : isDone ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: idx > game.step ? 0.6 : 1
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDone ? '#22c55e' : isCurrent ? '#eab308' : '#cbd5e1',
                color: 'white',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>
                {isDone ? '✓' : idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <b style={{ fontSize: '13px', color: '#1e293b' }}>{m.title}</b>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{m.desc}</div>
              </div>

              {isDone && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '900' }}>Hoàn thành</span>}
              {isCurrent && <span style={{ fontSize: '12px', color: '#ca8a04', fontWeight: '900' }}>Đang làm</span>}
              {!isDone && !isCurrent && <span style={{ fontSize: '12px', color: '#94a3b8' }}>🔒 Khóa</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
