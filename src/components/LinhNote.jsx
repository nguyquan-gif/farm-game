export default function LinhNote({
  children,
  title = "Linh · Người bạn bên kia suối",
}) {
  return (
    <div className="linh-note">
      <img src="./art/linh-portrait.webp" alt="" />
      <div>
        <b>{title}</b>
        <p>{children}</p>
      </div>
    </div>
  );
}
