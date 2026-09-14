export default function EntityDeleteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Hapus Data?</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Data yang dihapus tidak dapat dikembalikan.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#ef4444",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
