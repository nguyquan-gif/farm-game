import Icon from "./Icon.jsx";
export default function Feedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div
      key={feedback.id}
      className={`feedback ${feedback.ok ? "success" : "error"}`}
      role="status"
      aria-live="polite"
    >
      {feedback.reward && (
        <div className="reward-float">
          <Icon name="star" size={19} />
          {feedback.reward}
        </div>
      )}
      {feedback.reward && feedback.ok && (
        <div className="particles" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={{
                "--x": `${((i % 6) - 2.5) * 33}px`,
                "--y": `${-40 - (i % 4) * 24}px`,
                "--r": `${i * 57}deg`,
                "--delay": `${(i % 3) * 40}ms`,
              }}
            />
          ))}
        </div>
      )}
      <div className="toast">
        <Icon name={feedback.ok ? "check" : "leaf"} size={19} />
        <span>{feedback.message}</span>
      </div>
    </div>
  );
}
