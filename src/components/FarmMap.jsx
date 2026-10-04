import Icon from "./Icon.jsx";
import { MISSIONS, ZONE_NAMES } from "../data/missions.js";
import { missionIndex, zoneStatus } from "../game/engine.js";
const positions = {
  house: [44, 24],
  coop: [78, 43],
  water: [18, 49],
  field: [38, 73],
  market: [79, 85],
};
const icons = {
  house: "home",
  coop: "chicken",
  water: "water",
  field: "leaf",
  market: "market",
};
function Tree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="18" rx="19" ry="7" fill="#264d30" opacity=".12" />
      <path d="M-3 5h6v17h-6Z" fill="#806348" />
      <circle cy="-8" r="21" fill="#487b47" />
      <circle cx="-7" cy="-15" r="14" fill="#629752" />
      <circle cx="8" cy="-10" r="13" fill="#79a961" />
      <path d="m0-8 1 21" stroke="#3f713f" opacity=".45" />
    </g>
  );
}
function Crop({ x, y, ready }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="4" rx={ready ? 9 : 4} ry="4" fill="#3e5728" opacity=".3" />
      <path
        d={
          ready
            ? "M0 3C-19 0-7-17 0-4c7-13 19 4 0 7Z"
            : "M0 3c-10-1-8-10-1-5 5-9 13-2 1 5Z"
        }
        fill={ready ? "#447d36" : "#79ae53"}
        stroke="#35632d"
        strokeWidth="1"
      />
      <path d="M0 3V-6" stroke="#b3ce7f" />
    </g>
  );
}
function Chicken({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="8" rx="10" ry="3" fill="#796641" opacity=".25" />
      <ellipse rx="9" ry="7" fill="#fff6df" />
      <circle cx="6" cy="-7" r="5" fill="#fff6df" />
      <path d="m10-7 5 2-5 2" fill="#d79236" />
      <circle cx="7" cy="-9" r="1" fill="#493d2d" />
      <path d="m3-11 1-4 3 1 2-2 2 4" fill="#b95138" />
      <path d="m-4 6-1 5m7-5 1 5" stroke="#a4743c" strokeWidth="2" />
    </g>
  );
}
export default function FarmMap({ game, onOpen }) {
  const current = MISSIONS[missionIndex(game)]?.target || "house";
  const locked = missionIndex(game) < 4;
  return (
    <section className="farm-world" aria-label="Bản đồ nông trại tương tác">
      <div className="world-heading">
        <span>
          <Icon name="sun" size={16} />
          Ngày {game.day} · Nắng dịu
        </span>
        <span>Thung lũng của bạn</span>
      </div>
      <div className="map-stage">
        <svg className="world-art" viewBox="0 0 400 420" aria-hidden="true">
          <defs>
            <linearGradient id="land" x2="0" y2="1">
              <stop stopColor="#adc879" />
              <stop offset="1" stopColor="#86a963" />
            </linearGradient>
            <linearGradient id="river" x2="1" y2="1">
              <stop stopColor="#9ccbc1" />
              <stop offset="1" stopColor="#60a8ac" />
            </linearGradient>
            <linearGradient id="soil" x2="0" y2="1">
              <stop stopColor="#ab8055" />
              <stop offset="1" stopColor="#755336" />
            </linearGradient>
            <pattern
              id="grass"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="m6 14 2-3 2 3m10 7 2-2"
                stroke="#668e50"
                opacity=".15"
                fill="none"
              />
            </pattern>
          </defs>
          <ellipse
            cx="200"
            cy="373"
            rx="170"
            ry="25"
            fill="#385339"
            opacity=".13"
          />
          <path
            d="M20 200Q30 144 110 120L279 122Q365 148 383 232L375 315Q347 381 198 390 40 379 24 308Z"
            fill="#765338"
          />
          <path
            d="M20 185Q30 128 111 104L279 107Q366 134 383 216L375 299Q347 365 198 374 40 363 24 292Z"
            fill="#b69463"
          />
          <path
            d="M20 173Q31 120 111 98L279 100Q366 127 383 204L375 287Q347 353 198 363 40 351 24 280Z"
            fill="url(#land)"
          />
          <path
            d="M20 173Q31 120 111 98L279 100Q366 127 383 204L375 287Q347 353 198 363 40 351 24 280Z"
            fill="url(#grass)"
          />
          <path
            d="M53 153Q105 180 77 219T57 288Q69 326 154 343"
            stroke="#d5dbaf"
            strokeWidth="25"
            fill="none"
          />
          <path
            d="M53 153Q105 180 77 219T57 288Q69 326 154 343"
            stroke="url(#river)"
            strokeWidth="17"
            fill="none"
          />
          <path
            d="M67 173l13 3m-17 82 11 3m15 57 14 6"
            stroke="#d8ede2"
            strokeWidth="2"
            fill="none"
            opacity=".8"
          />
          <path
            d="M183 151Q153 204 221 245T294 321"
            stroke="#e8d3a1"
            strokeWidth="24"
            fill="none"
          />
          <path
            d="m196 240-59 56m86-57 77-40"
            stroke="#e8d3a1"
            strokeWidth="17"
          />
          <path d="m153 298 42 10" stroke="#95734c" strokeWidth="22" />
          <path
            d="m153 290 42 10m-39-5 42 10m-39-5 42 10"
            stroke="#d0ac71"
            strokeWidth="3"
          />
          <Tree x={58} y={128} />
          <Tree x={115} y={95} scale={1.3} />
          <Tree x={335} y={144} scale={1.15} />
          <Tree x={360} y={252} scale={0.8} />
          <Tree x={40} y={278} scale={0.75} />
          <g transform="translate(172 128)">
            <ellipse cy="28" rx="44" ry="11" fill="#405a30" opacity=".16" />
            <path d="m-30-2 42-10 22 13v40l-42 10-22-12Z" fill="#efddb5" />
            <path d="m12-12 22 13v40L12 28Z" fill="#d9c492" />
            <path
              d="m-37-3 29-31 51 14-25 28Z"
              fill={game.houseFixed ? "#a45638" : "#8e6750"}
            />
            <path d="m-37-3 29-31v38Z" fill="#bc7650" />
            <path d="m-8-34 51 14v7L-8-27Z" fill="#ce946b" />
            <path d="M-21 14h12v22h-12Z" fill="#765235" />
            <path d="M2 9h9v12H2Z" fill="#eccf71" stroke="#977244" />
            <path d="m25 10 5 3v11l-5-3Z" fill="#bd9f68" />
            <path d="M14-25v-19l9 3v19Z" fill="#af997a" />
            <path d="M-29 31h21v5h-21Z" fill="#bd9c6b" />
          </g>
          <g transform="translate(292 190)">
            <ellipse cy="28" rx="38" ry="10" fill="#405a30" opacity=".2" />
            <path d="M-32-8h51v47h-51Z" fill="#b66b43" />
            <path d="m19-8 17 12v36l-17-1Z" fill="#9d583b" />
            <path d="m-39-7 25-29 42 6 17 34-26-12Z" fill="#785238" />
            <path d="m-39-7 25-29 33 28Z" fill="#b39a64" />
            <path d="M-17 13H2v26h-19Z" fill="#613d29" />
            <path
              d="M-25 0H9M-27 6H9M7 14h8v11H7Z"
              stroke="#d5a66b"
              fill="#eccd92"
              strokeWidth="2"
            />
            <Chicken x={-19} y={45} />
            <Chicken x={14} y={49} />
            {game.coop.status === "egg-ready" && (
              <g fill="#fff4d3" stroke="#c3a66f">
                <ellipse cx="-6" cy="47" rx="4" ry="6" />
                <ellipse cx="3" cy="48" rx="4" ry="6" />
              </g>
            )}
          </g>
          <g transform="translate(70 216)">
            <ellipse cy="21" rx="24" ry="8" fill="#375933" opacity=".15" />
            <path
              d="M-18-6v30c0 11 37 11 37 0V-6Z"
              fill="#b2bcb0"
              stroke="#718b7d"
              strokeWidth="2"
            />
            <path
              d={`M-17 ${22 - game.water * 0.25}v23c0 9 34 9 34 0V${22 - game.water * 0.25}Z`}
              fill="#72b3b3"
              opacity=".65"
            />
            <ellipse
              cy="-6"
              rx="19"
              ry="8"
              fill="#d8ddd0"
              stroke="#718b7d"
              strokeWidth="2"
            />
            <ellipse cy="-6" rx="13" ry="4" fill="#83b9b4" />
            <path
              d="m19 11 11 3v19"
              fill="none"
              stroke="#98764f"
              strokeWidth="4"
            />
            {!game.waterFixed && (
              <path
                className="leak-drop"
                d="M30 34q-8 10 0 10t0-10"
                fill="#609eaa"
              />
            )}
          </g>
          {game.plots.map((p, i) => (
            <g
              key={p.id}
              transform={`translate(${118 + i * 43} ${281 + i * 14})`}
            >
              <path d="m-26 0 43-15 27 19-44 17Z" fill="#c49b63" />
              <path d="m-23 0 40-12 23 16-40 14Z" fill="url(#soil)" />
              <path
                d="m-13 1 34-11m-24 18 34-11m-24 18 33-11"
                stroke="#684c32"
                strokeWidth="2"
                opacity=".6"
              />
              {p.state !== "empty" &&
                [
                  [0, 0],
                  [14, -5],
                  [12, 8],
                  [26, 3],
                ].map(([x, y], j) => (
                  <Crop
                    key={j}
                    x={x - 9}
                    y={y - 1}
                    ready={p.state === "ready"}
                  />
                ))}
            </g>
          ))}
          <g transform="translate(301 314)" opacity={locked ? 0.7 : 1}>
            <ellipse cy="23" rx="34" ry="9" fill="#375933" opacity=".16" />
            <path d="M-25-23h51v44h-51Z" fill="#c8975b" />
            <path d="M-30-24h62l-7 18h-49Z" fill="#f6dd9f" />
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${-25 + i * 16} -24h8l-3 18h-8Z`}
                fill="#7c9a63"
              />
            ))}
            <path d="M-29-5h56v9h-56Z" fill="#efe0b1" />
            <path d="M-22 6h43v16h-43Z" fill="#997048" />
            <Crop x={-11} y={4} ready />
            <Crop x={7} y={4} ready />
            {game.milestones.market && (
              <path d="M-38-38q40 15 77 0" stroke="#826f4b" fill="none" />
            )}
            {game.milestones.market &&
              [-27, -10, 8, 25].map((x, i) => (
                <path
                  key={x}
                  d={`m${x} -34 5 9 5-8Z`}
                  fill={i % 2 ? "#f0c269" : "#b36a4a"}
                />
              ))}
          </g>
          <g stroke="#987c50" strokeWidth="3" fill="none">
            <path d="m96 322 1 21m17-14 1 20m17-15 1 20m-38-21 42 9m-40-2 40 9" />
            <path d="m340 278-1 19m14-23-1 18m14-24-1 18m-26 0 27-13m-28 21 27-13" />
          </g>
          {[
            [105, 222],
            [258, 133],
            [337, 320],
            [85, 309],
            [208, 339],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 5V-2" stroke="#668049" />
              <circle r="3" fill={i % 2 ? "#f5df9c" : "#e2b9a4"} />
              <circle r="1" fill="#bd8c4e" />
            </g>
          ))}
        </svg>
        {Object.entries(positions).map(([zone, [x, y]]) => (
          <button
            key={zone}
            className={`map-pin pin-${zone} ${current === zone ? "is-target" : ""} ${zone === "market" && locked ? "is-locked" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onOpen(zone)}
            aria-label={`${ZONE_NAMES[zone]}: ${zoneStatus(game, zone)}`}
          >
            <span className="pin-head">
              <Icon
                name={zone === "market" && locked ? "lock" : icons[zone]}
                size={20}
              />
              {current === zone && <span className="target-dot" />}
            </span>
            <span className="pin-label">
              <b>{ZONE_NAMES[zone]}</b>
              <span>{zoneStatus(game, zone)}</span>
            </span>
          </button>
        ))}
        <div className="map-coordinates">
          GV · 01 <span>Chạm để khám phá</span>
        </div>
      </div>
    </section>
  );
}
