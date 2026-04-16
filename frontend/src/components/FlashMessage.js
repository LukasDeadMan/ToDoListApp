export default function FlashMessage({ flash, onDismiss }) {
  if (!flash) {
    return null;
  }

  return (
    <div className={`flash flash--${flash.type}`} role="status">
      <p>{flash.message}</p>

      <button
        aria-label="Fechar alerta"
        className="flash__dismiss"
        onClick={onDismiss}
        type="button"
      >
        Fechar
      </button>
    </div>
  );
}
