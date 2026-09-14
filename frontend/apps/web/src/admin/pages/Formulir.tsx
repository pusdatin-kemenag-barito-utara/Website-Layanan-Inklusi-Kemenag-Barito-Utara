import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";

const kategoriMap: Record<string, string> = {
  disabilitas_fisik: "Disabilitas Fisik",
  disabilitas_sensorik: "Disabilitas Sensorik",
  lansia: "Lansia",
  ibu_hamil: "Ibu Hamil / Menyusui",
  lainnya: "Lainnya",
};

const layananMap: Record<string, string> = {
  haji: "Haji / Umrah",
  nikah: "KUA / Pernikahan",
  madrasah: "Pendidikan Madrasah",
  agama: "Konsultasi Keagamaan",
  lainnya: "Lainnya",
};

const label = (map: Record<string, string>, v: unknown) => map[String(v ?? "")] ?? String(v ?? "-");

const config: EntityConfig = {
  title: "Formulir Identifikasi",
  addLabel: "Tambah Data",
  table: "formulir_identifikasi",
  fields: [
    { name: "nama", label: "Nama Lengkap", type: "text", required: true },
    { name: "nik", label: "NIK", type: "text", required: true },
    { name: "telepon", label: "No. Telepon", type: "text" },
    { name: "kategori", label: "Kategori", type: "select", options: Object.keys(kategoriMap), required: true },
    { name: "layanan", label: "Layanan", type: "select", options: Object.keys(layananMap) },
    { name: "kebutuhan", label: "Kebutuhan Spesifik", type: "textarea" },
  ],
  columns: [
    { key: "nama", label: "Nama" },
    { key: "nik", label: "NIK" },
    { key: "telepon", label: "Telepon" },
    { key: "kategori", label: "Kategori", render: (row) => label(kategoriMap, row.kategori) },
    { key: "layanan", label: "Layanan", render: (row) => label(layananMap, row.layanan) },
  ],
};

export default function FormulirPage() {
  return <EntityPage config={config} />;
}