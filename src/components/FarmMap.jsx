import Icon from "./Icon.jsx";
import Produce from "./Produce.jsx";
import { MISSIONS, ZONE_NAMES } from "../data/missions.js";
import { CROPS } from "../data/crops.js";
import { missionIndex, zoneStatus } from "../game/engine.js";
const sites = [
  { id: "house", x: 49, y: 26, icon: "home" },
  { id: "water", x: 16, y: 39, icon: "water" },
  { id: "coop", x: 82, y: 43, icon: "chicken" },
  { id: "market", x: 79, y: 68, icon: "market" },
];
const beds = [
  {
    x: 18,
    y: 56,
    points: [
      [132, 808],
      [182, 794],
      [171, 851],
      [223, 835],
      [216, 894],
      [268, 879],
    ],
  },
  {
    x: 31,
    y: 53.7,
    points: [
      [244, 773],
      [288, 761],
      [291, 811],
      [335, 798],
      [337, 851],
      [384, 838],
    ],
  },
  {
    x: 43,
    y: 51.5,
    points: [
      [344, 744],
      [389, 733],
      [398, 781],
      [440, 767],
      [447, 821],
      [492, 806],
    ],
  },
];
function Chicken({ x, y, flip = false, fed }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <g className={`hen ${fed ? "fed" : ""}`}>
        <ellipse cx="0" cy="18" rx="26" ry="9" fill="#695338" opacity=".23" />
        <path d="m-9 16-4 10m19-10 3 10" stroke="#d99b45" strokeWidth="5" />
        <path
          d="M-16 8Q-46-8-29-19l14 12c20-18 34-3 34 9 0 27-36 29-35 6"
          fill="#fff3ce"
          stroke="#ac854e"
          strokeWidth="2"
        />
        <ellipse cx="-3" cy="9" rx="15" ry="10" fill="#e3d1a3" />
        <path d="M10-12q-8-13 1-14 3 4 5 4 7-6 9 1 0 7-15 9" fill="#c45736" />
        <circle cx="15" cy="-8" r="11" fill="#fff3ce" />
        <path d="m23-7 13 6-13 2" fill="#e1a136" />
        <circle cx="18" cy="-10" r="2.7" fill="#3c3328" />
      </g>
    </g>
  );
}
function Villager({ x, y, shirt, hat = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="30" rx="21" ry="7" fill="#493f2b" opacity=".2" />
      <path
        d="M-8 15v19m16-19v19"
        stroke="#69543c"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M-13-5q13-7 26 0l5 25h-36Z" fill={shirt} />
      <path
        d="m-12-2-7 15m31-15 9 12"
        stroke="#d1a37a"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cy="-17" r="13" fill="#4c392a" />
      <ellipse cy="-13" rx="10" ry="12" fill="#dcac80" />
      {hat ? (
        <>
          <ellipse cy="-25" rx="22" ry="6" fill="#caa967" />
          <path d="M-14-27q0-18 14-18t14 18" fill="#d9b875" />
        </>
      ) : (
        <path d="M-11-18q-3-20 8-18 17-2 16 22L4-26Z" fill="#54422d" />
      )}
    </g>
  );
}
export default function FarmMap({ game, onOpen, act, feedback }) {
  const mission = MISSIONS[missionIndex(game)],
    target = mission?.target;
  const night = game.milestones.festival && game.day === game.festivalDay;
  const rain = game.day % 3 === 0 && !night;
  return (
    <div
      className={`farm-world ${night ? "festival-night" : ""} ${rain ? "rainy" : ""}`}
    >
      <div className="world-stage">
        <img
          className="world-art"
          src="./art/valley-world.webp"
          alt="Thung lũng xanh với mái nhà ngói, chuồng gà, vườn rau và phiên chợ bên dòng suối"
          fetchPriority="high"
          draggable="false"
        />
        <svg className="world-life" viewBox="0 0 1024 1536" aria-hidden="true">
          <defs>
            <radialGradient id="lamp">
              <stop stopColor="#fff2a5" stopOpacity=".9" />
              <stop offset="1" stopColor="#f4ad49" stopOpacity="0" />
            </radialGradient>
          </defs>
          {!game.houseFixed && (
            <g className="roof-patch">
              <path
                d="m454 229 66-6 45 67-69 4Z"
                fill="#776549"
                opacity=".75"
              />
              <path
                d="m469 235 43-1m-35 12 43-1m-36 12 43-1m-33 12 43-1"
                stroke="#b4a079"
                strokeWidth="5"
              />
            </g>
          )}
          {game.houseFixed && (
            <g>
              <circle cx="489" cy="353" r="58" fill="url(#lamp)" />
              <path
                d="M422 390q15-26 29 0m91-7q15-27 29 0"
                stroke="#cd8a76"
                strokeWidth="12"
              />
            </g>
          )}
          {!game.waterFixed && (
            <g className="leak">
              <path
                d="M141 448q-23 20-17 73"
                stroke="#b4e9e1"
                strokeWidth="8"
                strokeDasharray="10 10"
                fill="none"
              />
              <ellipse
                cx="122"
                cy="526"
                rx="24"
                ry="8"
                fill="#71c9c7"
                opacity=".65"
              />
            </g>
          )}
          <Chicken x={747} y={619} fed={game.coop.status !== "hungry"} />
          <Chicken x={842} y={650} flip fed={game.coop.status !== "hungry"} />
          {game.chickens >= 3 && (
            <Chicken x={792} y={661} fed={game.coop.status !== "hungry"} />
          )}
          {game.chickens >= 4 && (
            <Chicken x={895} y={613} flip fed={game.coop.status !== "hungry"} />
          )}
          {game.coop.status === "egg-ready" && (
            <g>
              <ellipse cx="820" cy="588" rx="34" ry="13" fill="#ba8c4b" />
              <ellipse cx="808" cy="580" rx="12" ry="16" fill="#fff4cf" />
              <ellipse cx="830" cy="579" rx="12" ry="17" fill="#fff4cf" />
            </g>
          )}
          {game.plots.map(
            (plot, i) =>
              plot.state !== "empty" && (
                <g key={plot.id} className={`crop-group ${plot.state}`}>
                  {beds[i].points.map(([x, y], n) => (
                    <g
                      key={n}
                      transform={`translate(${x - 24} ${y - (plot.state === "ready" ? 45 : 19)})`}
                      opacity={plot.state === "ready" ? 1 : 0.85}
                    >
                      <Produce
                        kind={plot.state === "ready" ? plot.crop : "greens"}
                        size={plot.state === "ready" ? 51 : 30}
                      />
                    </g>
                  ))}
                  {plot.watered && (
                    <path
                      d={`M${beds[i].points[0][0] - 10} ${beds[i].points[0][1] + 8}l130 100`}
                      stroke="#5eafb9"
                      opacity=".45"
                      strokeWidth="7"
                    />
                  )}
                </g>
              ),
          )}
          {game.plots.length < 3 && (
            <g fill="#677c41" opacity=".85">
              <path
                d="m382 761 113 80m-69-93-2 95"
                stroke="#98835e"
                strokeWidth="13"
              />
              <path d="m382 759 113 80" stroke="#c6ae7d" strokeWidth="3" />
            </g>
          )}
          {!game.milestones.market && (
            <path
              d="m717 962 147 29 1 42-158-29Z"
              fill="#816f4e"
              opacity=".72"
            />
          )}
          {game.milestones.market && (
            <g>
              <path
                d="M679 800q144 140 301 33"
                fill="none"
                stroke="#876744"
                strokeWidth="3"
              />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`m${696 + i * 44} ${823 + Math.sin(i * 0.55) * 46} 15 25 16-15Z`}
                  fill={i % 2 ? "#e8b446" : "#749850"}
                />
              ))}
              <g transform="translate(755 966)">
                <Produce kind="tomato" size={42} />
              </g>
              <g transform="translate(805 978)">
                <Produce kind="greens" size={42} />
              </g>
            </g>
          )}
          <g transform="translate(663 975)" className="linh-in-world">
            <ellipse
              cx="0"
              cy="35"
              rx="23"
              ry="8"
              fill="#33402d"
              opacity=".22"
            />
            <path
              d="M-9 18v20m18-20v20"
              stroke="#74543a"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M-14-3q14-9 28 0l7 29h-42Z"
              fill="#668346"
              stroke="#4b6637"
              strokeWidth="2"
            />
            <path
              d="m-13 1-11 15m37-15 12 6"
              stroke="#edd4a1"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cy="-19" r="15" fill="#4b3729" />
            <ellipse cy="-14" rx="12" ry="14" fill="#e1ac7c" />
            <path d="M-9-22q10 3 20 0" stroke="#4b3729" strokeWidth="4" />
            <ellipse
              cy="-26"
              rx="26"
              ry="7"
              fill="#d6ac66"
              stroke="#a08147"
              strokeWidth="2"
            />
            <path d="M-16-28q-1-22 15-22t17 22" fill="#edc788" />
            <path d="M-15-30q17 6 31 0" stroke="#b7794e" strokeWidth="4" />
          </g>
          {game.milestones.festival && (
            <>
              <Villager x={388} y={1058} shirt="#ba8254" hat />
              <Villager x={598} y={1085} shirt="#dbbc73" />
            </>
          )}
          {game.milestones.feast && (
            <g>
              <path
                d="m450 1030 157 29-41 31-157-26Z"
                fill="#f4dcb0"
                stroke="#a5784d"
                strokeWidth="4"
              />
              <path
                d="M423 1067v33m142-14v34"
                stroke="#906442"
                strokeWidth="9"
              />
              <ellipse cx="492" cy="1063" rx="23" ry="8" fill="#fff4de" />
              <ellipse cx="548" cy="1070" rx="19" ry="7" fill="#e4a76c" />
            </g>
          )}
          {game.milestones.festival && (
            <g className="festival-lights">
              <path
                d="M240 420q272 250 651 59"
                stroke="#7d5934"
                fill="none"
                strokeWidth="4"
              />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <g
                  key={i}
                  transform={`translate(${265 + i * 81} ${453 + Math.sin((i / 7) * Math.PI) * 87})`}
                >
                  <circle r="65" fill="url(#lamp)" opacity={night ? 1 : 0.15} />
                  <path d="M0-4v22" stroke="#8f683d" strokeWidth="3" />
                  <rect
                    x="-13"
                    y="8"
                    width="26"
                    height="35"
                    rx="10"
                    fill={i % 2 ? "#f0a255" : "#f7d77a"}
                  />
                  <path
                    d="M-10 11h20M-10 39h20"
                    stroke="#be6e37"
                    strokeWidth="3"
                  />
                </g>
              ))}
            </g>
          )}
        </svg>
        {sites.map((site) => (
          <button
            key={site.id}
            className={`map-pin pin-${site.id} ${target === site.id ? "quest-target" : ""} ${site.id === "market" && !game.milestones.market ? "unopened" : ""}`}
            style={{ left: `${site.x}%`, top: `${site.y}%` }}
            aria-label={`${ZONE_NAMES[site.id]}: ${zoneStatus(game, site.id)}`}
            onClick={() => onOpen(site.id)}
          >
            <span className="pin-icon">
              <Icon name={site.icon} size={19} />
              {target === site.id && <i className="target-dot">!</i>}
            </span>
            <span className="pin-label">
              {site.id === "house"
                ? "Nhà"
                : site.id === "water"
                  ? !game.waterFixed
                    ? "Sửa ống nước"
                    : `${game.water}% nước`
                  : site.id === "coop"
                    ? game.coop.status === "hungry"
                      ? "Gà đang đói"
                      : game.coop.status === "fed"
                        ? "Đang ấp trứng"
                        : "Nhặt trứng"
                    : night
                      ? "Hội mùa"
                      : game.milestones.market
                        ? "Giao đơn"
                        : "Linh đang đợi"}
            </span>
          </button>
        ))}
        {game.plots.map((p, i) => (
          <button
            key={p.id}
            className={`plot-hit ${p.state} ${target === "field" && (p.state === "ready" || !game.plots.some((q) => q.state === "ready")) ? "plot-target" : ""}`}
            style={{ left: `${beds[i].x}%`, top: `${beds[i].y}%` }}
            aria-label={`Luống ${p.id}: ${CROPS[p.crop].name}, ${p.state === "ready" ? "thu hoạch" : p.state === "empty" ? "gieo hạt" : "đang lớn"}`}
            onClick={() =>
              p.state === "ready"
                ? act({ type: "HARVEST", plotId: p.id })
                : onOpen("field", p.id)
            }
          >
            <span>
              {p.state === "ready" ? (
                <Icon name="bag" size={19} />
              ) : p.state === "empty" ? (
                "+"
              ) : p.watered ? (
                <Icon name="check" size={17} />
              ) : (
                <Icon name="water" size={18} />
              )}
            </span>
          </button>
        ))}
        <button
          className="field-sign"
          onClick={() => onOpen("field")}
          aria-label={`${ZONE_NAMES.field}: ${zoneStatus(game, "field")}`}
        >
          Vườn của ông <Icon name="arrow" size={13} />
        </button>
        {feedback?.ok &&
          feedback.reward &&
          !["house"].includes(feedback.zone) && (
            <div
              key={feedback.id}
              className={`world-reward reward-${feedback.zone || "field"}`}
              aria-hidden="true"
            >
              {feedback.reward.split(" · ")[0]}
            </div>
          )}
        <div className="butterfly b-one" aria-hidden="true" />
        <div className="butterfly b-two" aria-hidden="true" />
        {rain && <div className="rain" aria-hidden="true" />}
        {night && (
          <div className="fireflies" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${12 + ((i * 17) % 80)}%`,
                  top: `${30 + ((i * 13) % 50)}%`,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
