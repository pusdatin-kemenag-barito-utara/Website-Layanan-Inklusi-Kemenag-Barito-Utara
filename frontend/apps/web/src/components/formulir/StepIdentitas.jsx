import { VoiceInput } from "./VoiceControls";
import { labelStyle } from "./styles";

export default function StepIdentitas({ form, onChange }) {
  return (
    <div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.2rem", color: "var(--text-color)" }}>
        Langkah 1: Informasi Pribadi
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <label style={labelStyle}>Nama Lengkap *</label>
          <VoiceInput
            name="nama"
            value={form.nama}
            onChange={onChange}
            placeholder="Ketik atau sebutkan nama lengkap"
          />
        </div>
        <div>
          <label style={labelStyle}>Nomor Induk Kependudukan (NIK) *</label>
          <VoiceInput
            name="nik"
            value={form.nik}
            onChange={onChange}
            placeholder="Contoh: 620102xxxxxxxxxx"
          />
        </div>
        <div>
          <label style={labelStyle}>Nomor Telepon / WhatsApp</label>
          <VoiceInput
            name="telepon"
            value={form.telepon}
            onChange={onChange}
            placeholder="Contoh: 08123456789"
          />
        </div>
      </div>
    </div>
  );
}
