const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

export async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type Berita = {
  id: string | number;
  judul: string;
  slug: string;
  konten?: string;
  thumbnail?: string;
  tanggal?: string;
  status?: string;
  created_at?: string;
};

export type Dokumen = {
  id: string | number;
  judul: string;
  jenis?: string;
  url_file?: string;
  status?: string;
  tanggal?: string;
};

export type Pengumuman = {
  id: string | number;
  judul: string;
  konten?: string;
  tanggal?: string;
  status?: string;
};

export type Galeri = {
  id: string | number;
  judul: string;
  url_file?: string;
  tanggal?: string;
};