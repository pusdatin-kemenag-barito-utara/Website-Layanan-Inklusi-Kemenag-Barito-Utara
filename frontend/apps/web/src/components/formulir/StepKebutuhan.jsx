import { VoiceTextarea } from "./VoiceControls";
import { inputStyle, labelStyle } from "./styles";

export default function StepKebutuhan({ form, onChange }) {
  return (
    <div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.2rem", color: "var(--text-color)" }}>
        Langkah 2: Kategori & Kebutuhan Layanan
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <label style={labelStyle}>Kategori Kebutuhan Khusus *</label>
          <select name="kategori" value={form.kategori} onChange={onChange} style={inputStyle}>
            <option value="">-- Pilih Kategori --</option>
            <option value="disabilitas_fisik">Disabilitas Fisik (Pengguna Kursi Roda, Kruk, dll)</option>
            <option value="disabilitas_sensorik">Disabilitas Sensorik (Tunanetra / Tunarungu)</option>
            <option value="lansia">Lansia (Lanjut Usia)</option>
            <option value="ibu_hamil">Ibu Hamil / Menyusui</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Layanan yang Ingin Diakses</label>
          <select name="layanan" value={form.layanan} onChange={onChange} style={inputStyle}>
            <option value="">-- Pilih Layanan --</option>
            <option value="haji">Pendaftaran Haji / Umrah</option>
            <option value="nikah">Layanan KUA / Pernikahan</option>
            <option value="madrasah">Layanan Pendidikan Madrasah</option>
            <option value="agama">Konsultasi Keagamaan</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Jelaskan Kebutuhan Spesifik Anda (Opsional)</label>
          <VoiceTextarea
            name="kebutuhan"
            value={form.kebutuhan}
            onChange={onChange}
            placeholder="Contoh: Saya membutuhkan pendamping karena menggunakan kursi roda..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
