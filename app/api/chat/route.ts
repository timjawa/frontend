import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

export const runtime = "nodejs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequest = {
  message?: string;
  history?: ChatMessage[];
  messages?: ChatMessage[];
};

type ContextResult = {
  context: string;
  source: "mysql" | "backend_api" | "fallback_markdown";
};

const KECAMATAN_NAMES = [
  "Ajung",
  "Ambulu",
  "Arjasa",
  "Balung",
  "Bangsalsari",
  "Gumukmas",
  "Jenggawah",
  "Jombang",
  "Kalisat",
  "Kaliwates",
  "Kencong",
  "Ledokombo",
  "Mayang",
  "Mumbulsari",
  "Panti",
  "Pakusari",
  "Patrang",
  "Puger",
  "Rambipuji",
  "Semboro",
  "Silo",
  "Sukorambi",
  "Sumberbaru",
  "Sumberjambe",
  "Sumbersari",
  "Sukowono",
  "Tanggul",
  "Tempurejo",
  "Umbulsari",
  "Wuluhan",
];

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "GROQ_API_KEY belum diatur.",
        context_source: "none",
      },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as ChatRequest;
  const { question, history } = normalizeChatInput(body);

  if (!question) {
    return NextResponse.json(
      { error: "Pertanyaan tidak boleh kosong.", context_source: "none" },
      { status: 422 },
    );
  }

  const { context, source } = await buildContext(question);
  const messages = buildMessages(question, history, context);

  // Try primary model first, then fallbacks if rate-limited (429)
  const MODEL_LIST = [
    model,
    "llama-3.1-8b-instant",
  ];

  let answer: string | null = null;
  let lastError = "";

  for (const tryModel of MODEL_LIST) {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: tryModel,
        messages,
        temperature: 0.2,
        max_tokens: 800,
        stream: false,
      }),
    });

    if (groqRes.ok) {
      const data = await groqRes.json();
      answer = data.choices?.[0]?.message?.content ?? "Maaf, saya belum bisa membuat jawaban saat ini.";
      break;
    }

    lastError = `model ${tryModel}: HTTP ${groqRes.status}`;
    if (groqRes.status !== 429) break; // Non-429: stop retrying
    console.warn(`[chat] Rate limit on ${tryModel}, trying next model...`);
  }

  if (answer === null) {
    // All models failed — return helpful 200 response based on DB context
    const fallbackAnswer = buildContextBasedFallback(question, context, lastError);
    return NextResponse.json({
      answer: fallbackAnswer,
      reply: fallbackAnswer,
      context_source: source,
    });
  }

  return NextResponse.json({
    answer,
    reply: answer,
    context_source: source,
  });
}

function normalizeChatInput(body: ChatRequest) {
  if (typeof body.message === "string" && body.message.trim()) {
    return {
      question: body.message.trim(),
      history: normalizeHistory(body.history),
    };
  }

  const messages = normalizeHistory(body.messages);
  const lastUserIndex = messages.findLastIndex((item) => item.role === "user");
  if (lastUserIndex === -1) {
    return { question: "", history: [] };
  }

  return {
    question: messages[lastUserIndex].content.trim(),
    history: messages.slice(0, lastUserIndex).slice(-6),
  };
}

function normalizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as Partial<ChatMessage>;
      const role = value.role === "assistant" ? "assistant" : "user";
      const content = typeof value.content === "string" ? value.content.trim() : "";
      return content ? ({ role, content: content.slice(0, 1200) } as ChatMessage) : null;
    })
    .filter((item): item is ChatMessage => Boolean(item))
    .slice(-6);
}

async function buildContext(question: string): Promise<ContextResult> {
  const mysqlContext = await buildMysqlContext(question);
  if (mysqlContext) {
    return { context: mysqlContext, source: "mysql" };
  }

  const apiBase =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "https://api.jembersiaga.my.id/api";
  const keywords = question.toLowerCase();
  const kecamatan = findKecamatan(keywords);
  const sections: string[] = [];

  const kecamatanRows = await fetchApiRows(`${apiBase}/kecamatan?all=1`);
  sections.push(section("Kecamatan rawan", filterByKecamatan(kecamatanRows, kecamatan).slice(0, 40)));

  if (hasAny(keywords, ["cuaca", "hujan", "suhu", "angin", "prakiraan", "prediksi"]) || kecamatan) {
    let dayKeyword = "";
    if (keywords.includes("besok")) {
      dayKeyword = "besok";
    } else if (keywords.includes("lusa")) {
      dayKeyword = "lusa";
    }

    if (dayKeyword !== "besok" && dayKeyword !== "lusa") {
      const realtimeRows = await fetchApiRows(`${apiBase}/weather/realtime`);
      sections.push(section("Cuaca realtime", filterByKecamatan(realtimeRows, kecamatan).slice(0, 35)));
    }

    const forecastRows = await fetchApiRows(`${apiBase}/weather/forecast`);
    sections.push(section("Prakiraan cuaca terdekat", filterByKecamatan(forecastRows, kecamatan).slice(0, 24)));
  }

  if (hasAny(keywords, ["peringatan", "siaga", "darurat", "bahaya", "evakuasi"]) || kecamatan) {
    const warningRows = await fetchApiRows(`${apiBase}/peringatan-dini?is_active=1&per_page=20`);
    sections.push(section("Peringatan dini aktif", filterByKecamatan(warningRows, kecamatan).slice(0, 20)));
  }

  if (hasAny(keywords, ["pos", "pengungsian", "kapasitas", "penuh", "shelter", "tempat aman"]) || kecamatan) {
    const shelterRows = await fetchApiRows(`${apiBase}/pos-pengungsian?per_page=20`);
    sections.push(section("Pos pengungsian", filterByKecamatan(shelterRows, kecamatan).slice(0, 20)));
  }

  if (hasAny(keywords, ["kontak", "telepon", "nomor", "call center", "ambulans", "damkar", "rumah sakit", "bpbd"])) {
    const contactRows = await fetchApiRows(`${apiBase}/kontak-darurat?all=1`);
    sections.push(section("Kontak darurat aktif", contactRows.filter((row) => row.is_active !== false).slice(0, 30)));
  }

  if (hasAny(keywords, ["faq", "cara", "akun", "aplikasi", "jesi", "pengaduan", "foto"])) {
    const faqRows = await fetchApiRows(`${apiBase}/faq`);
    sections.push(section("FAQ aktif", faqRows.filter((row) => row.is_active !== false).slice(0, 20)));
  }

  if (hasAny(keywords, ["berita", "artikel", "kabar", "informasi"])) {
    const newsRows = await fetchApiRows(`${apiBase}/berita?per_page=10`);
    sections.push(section("Berita published", newsRows.slice(0, 10)));
  }

  const context = sections.filter(Boolean).join("\n\n").trim();
  if (context) {
    return { context, source: "backend_api" };
  }

  return { context: await fallbackContext(), source: "fallback_markdown" };
}

async function buildMysqlContext(question: string): Promise<string> {
  const keywords = question.toLowerCase();
  const kecamatan = findKecamatan(keywords);

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_DATABASE ?? "jember_siaga",
      user: process.env.DB_USERNAME ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      connectTimeout: 3500,
      dateStrings: true,
    });

    const parts: string[] = [];

    parts.push(
      section(
        "Kecamatan rawan",
        await dbRows(
          connection,
          `SELECT nama, level_rawan, elevasi, latitude, longitude
           FROM kecamatan
           WHERE (? = '' OR nama = ?)
           ORDER BY FIELD(level_rawan, 'tinggi', 'sedang', 'rendah'), nama
           LIMIT 40`,
          [kecamatan, kecamatan],
        ),
      ),
    );

    if (hasAny(keywords, ["cuaca", "hujan", "suhu", "angin", "prakiraan", "prediksi"]) || kecamatan) {
      let dayKeyword = "";
      if (keywords.includes("besok")) {
        dayKeyword = "besok";
      } else if (keywords.includes("lusa")) {
        dayKeyword = "lusa";
      } else if (keywords.includes("hari ini") || keywords.includes("sekarang") || keywords.includes("realtime") || keywords.includes("saat ini")) {
        dayKeyword = "hari ini";
      }

      if (kecamatan) {
        // Specific kecamatan — return full detail
        if (dayKeyword !== "besok" && dayKeyword !== "lusa") {
          parts.push(
            section(
              "Cuaca realtime (cuaca_realtime)",
              await dbRows(
                connection,
                `SELECT k.nama AS kecamatan, c.suhu, c.feels_like, c.kelembapan, c.curah_hujan,
                        c.cloud_cover, c.kecepatan_angin, c.deskripsi, c.visibilitas,
                        c.tekanan_udara, c.fetched_at
                 FROM cuaca_realtime c
                 JOIN kecamatan k ON k.id = c.kecamatan_id
                 WHERE k.nama = ?
                 LIMIT 1`,
                [kecamatan],
              ),
            ),
          );
        }

        // Weather predictions/forecast for specific kecamatan
        let forecastSql = `
          SELECT k.nama AS kecamatan, p.waktu_lokal, p.suhu, p.kelembapan,
                 p.curah_hujan, p.cloud_cover, p.deskripsi_cuaca,
                 p.kecepatan_angin, p.uv_index
          FROM perkiraan_cuaca p
          JOIN kecamatan k ON k.id = p.kecamatan_id
          WHERE k.nama = ?
        `;
        let forecastParams = [kecamatan];

        if (dayKeyword === "besok") {
          forecastSql += " AND DATE(p.waktu_lokal) = DATE_ADD(CURDATE(), INTERVAL 1 DAY) LIMIT 8";
        } else if (dayKeyword === "lusa") {
          forecastSql += " AND DATE(p.waktu_lokal) = DATE_ADD(CURDATE(), INTERVAL 2 DAY) LIMIT 8";
        } else if (dayKeyword === "hari ini") {
          forecastSql += " AND DATE(p.waktu_lokal) = CURDATE() LIMIT 8";
        } else {
          forecastSql += " AND p.waktu_lokal >= DATE_SUB(NOW(), INTERVAL 1 HOUR) LIMIT 8";
        }

        parts.push(
          section(
            "Prakiraan cuaca terdekat (perkiraan_cuaca)",
            await dbRows(connection, forecastSql, forecastParams),
          ),
        );
      } else {
        // All kecamatan — use DB-level aggregation so context stays small
        if (dayKeyword !== "besok" && dayKeyword !== "lusa") {
          const aggRows = await dbRows(
            connection,
            `SELECT
               ROUND(AVG(c.suhu), 1)            AS rata_rata_suhu,
               ROUND(MIN(c.suhu), 1)            AS suhu_terendah,
               ROUND(MAX(c.suhu), 1)            AS suhu_tertinggi,
               ROUND(AVG(c.kelembapan), 1)      AS rata_rata_kelembapan,
               ROUND(AVG(c.curah_hujan), 2)     AS rata_rata_curah_hujan,
               ROUND(AVG(c.kecepatan_angin), 1) AS rata_rata_kecepatan_angin,
               COUNT(DISTINCT c.kecamatan_id)   AS jumlah_kecamatan_terpantau
             FROM cuaca_realtime c`,
          );
          const topDesc = await dbRows(
            connection,
            `SELECT c.deskripsi, COUNT(*) AS jumlah
             FROM cuaca_realtime c
             GROUP BY c.deskripsi
             ORDER BY jumlah DESC
             LIMIT 5`,
          );
          parts.push(
            `## Ringkasan cuaca realtime seluruh Kabupaten Jember (cuaca_realtime)\n` +
            section("Statistik cuaca", aggRows) +
            "\n" +
            section("Kondisi cuaca terbanyak (deskripsi)", topDesc),
          );
        }

        // General aggregated forecast for all Jember
        let forecastSql = `
          SELECT p.waktu_lokal,
                 ROUND(AVG(p.suhu), 1) AS rata_rata_suhu,
                 ROUND(AVG(p.kelembapan), 1) AS rata_rata_kelembapan,
                 ROUND(AVG(p.curah_hujan), 2) AS rata_rata_curah_hujan,
                 COUNT(DISTINCT p.kecamatan_id) AS jumlah_kecamatan
          FROM perkiraan_cuaca p
          WHERE 1=1
        `;
        if (dayKeyword === "besok") {
          forecastSql += " AND DATE(p.waktu_lokal) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";
        } else if (dayKeyword === "lusa") {
          forecastSql += " AND DATE(p.waktu_lokal) = DATE_ADD(CURDATE(), INTERVAL 2 DAY)";
        } else {
          forecastSql += " AND DATE(p.waktu_lokal) = CURDATE()";
        }
        forecastSql += " GROUP BY p.waktu_lokal ORDER BY p.waktu_lokal";

        parts.push(
          section(
            "Ringkasan perkiraan cuaca Kabupaten Jember (perkiraan_cuaca)",
            await dbRows(connection, forecastSql),
          ),
        );
      }
    }



    if (hasAny(keywords, ["peringatan", "siaga", "darurat", "bahaya", "evakuasi"]) || kecamatan) {
      parts.push(
        section(
          "Peringatan dini aktif",
          await dbRows(
            connection,
            `SELECT k.nama AS kecamatan, p.tingkat_urgensi, p.deskripsi, p.created_at
             FROM peringatan_dini p
             JOIN kecamatan k ON k.id = p.kecamatan_id
             WHERE p.is_active = 1 AND (? = '' OR k.nama = ?)
             ORDER BY FIELD(p.tingkat_urgensi, 'kritis', 'tinggi', 'sedang', 'rendah'), p.created_at DESC
             LIMIT 20`,
            [kecamatan, kecamatan],
          ),
        ),
      );
    }

    if (hasAny(keywords, ["pos", "pengungsian", "kapasitas", "penuh", "shelter", "tempat aman"]) || kecamatan) {
      parts.push(
        section(
          "Pos pengungsian",
          await dbRows(
            connection,
            `SELECT p.nama, k.nama AS kecamatan, p.alamat, p.kapasitas, p.terisi,
                    p.status, p.fasilitas, p.penanggung_jawab, p.telepon
             FROM pos_pengungsian p
             JOIN kecamatan k ON k.id = p.kecamatan_id
             WHERE p.is_active = 1 AND (? = '' OR k.nama = ?)
             ORDER BY FIELD(p.status, 'aktif', 'standby', 'penuh', 'tutup'), p.nama
             LIMIT 20`,
            [kecamatan, kecamatan],
          ),
        ),
      );
    }

    if (hasAny(keywords, ["kontak", "telepon", "nomor", "call center", "ambulans", "damkar", "rumah sakit", "bpbd"])) {
      parts.push(
        section(
          "Kontak darurat aktif",
          await dbRows(
            connection,
            `SELECT nama, nomor, kategori, keterangan
             FROM kontak_darurat
             WHERE is_active = 1
             ORDER BY kategori, nama
             LIMIT 30`,
          ),
        ),
      );
    }

    if (hasAny(keywords, ["laporan", "bencana", "banjir", "longsor", "gempa", "kebakaran", "status"]) || kecamatan) {
      parts.push(
        section(
          "Ringkasan laporan bencana",
          await dbRows(
            connection,
            `SELECT k.nama AS kecamatan, l.jenis_bencana, l.status, COUNT(*) AS jumlah
             FROM laporan_bencana l
             LEFT JOIN kecamatan k ON k.id = l.kecamatan_id
             WHERE l.is_draft = 0 AND (? = '' OR k.nama = ?)
             GROUP BY k.nama, l.jenis_bencana, l.status
             ORDER BY jumlah DESC, k.nama
             LIMIT 30`,
            [kecamatan, kecamatan],
          ),
        ),
      );
    }

    if (hasAny(keywords, ["faq", "cara", "akun", "aplikasi", "jesi", "pengaduan", "foto"])) {
      parts.push(
        section(
          "FAQ aktif",
          await dbRows(
            connection,
            `SELECT pertanyaan, jawaban, kategori
             FROM faq
             WHERE is_active = 1
             ORDER BY urutan, kategori
             LIMIT 20`,
          ),
        ),
      );
    }

    if (hasAny(keywords, ["berita", "artikel", "kabar", "informasi"])) {
      parts.push(
        section(
          "Berita published",
          await dbRows(
            connection,
            `SELECT judul, ringkasan, kategori, sumber, dipublikasi_pada
             FROM berita
             WHERE status = 'published'
             ORDER BY dipublikasi_pada DESC
             LIMIT 10`,
          ),
        ),
      );
    }

    return parts.filter(Boolean).join("\n\n").trim();
  } catch {
    return "";
  } finally {
    await connection?.end().catch(() => undefined);
  }
}

async function dbRows(
  connection: mysql.Connection,
  sql: string,
  params: Array<string | number | boolean | null> = [],
): Promise<Record<string, unknown>[]> {
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(sql, params);
    return rows as Record<string, unknown>[];
  } catch {
    return [];
  }
}

async function fetchApiRows(url: string): Promise<Record<string, unknown>[]> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) return [];
    return rowsFromPayload(await response.json());
  } catch {
    return [];
  }
}

function rowsFromPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.flatMap(rowsFromPayload);
  }

  if (!payload || typeof payload !== "object") return [];
  const object = payload as Record<string, unknown>;

  if (Array.isArray(object.data)) return object.data.flatMap(rowsFromPayload);
  if (object.data && typeof object.data === "object") {
    const data = object.data as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data.flatMap(rowsFromPayload);

    return Object.entries(data).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
          .map((item) => ({ kecamatan: key, ...item }));
      }
      return [];
    });
  }

  return [object];
}

function section(title: string, rows: Record<string, unknown>[]): string {
  const lines = rows
    .map((row) => {
      const pairs = Object.entries(flattenRow(row))
        .filter(([key, value]) => isSafeKey(key) && value !== null && value !== undefined && value !== "")
        .slice(0, 12)
        .map(([key, value]) => `${key}: ${normalizeValue(value)}`);

      return pairs.length ? `- ${pairs.join("; ")}` : "";
    })
    .filter(Boolean);

  return lines.length ? `## ${title}\n${lines.join("\n")}` : "";
}

function flattenRow(row: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (Array.isArray(value)) {
      output[key] = value.map((item) => normalizeValue(item)).join(", ");
    } else if (value instanceof Date) {
      output[key] = value;
    } else if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;
      if ("nama" in nested) output[key] = nested.nama;
    } else {
      output[key] = value;
    }
  }

  return output;
}

function isSafeKey(key: string): boolean {
  const lower = key.toLowerCase();
  return ![
    "id",
    "user_id",
    "author_id",
    "dibuat_oleh",
    "password",
    "token",
    "email",
    "remember_token",
    "api_key",
    "foto_cover",
    "media",
    "konten",
  ].some((blocked) => lower.includes(blocked));
}

function filterByKecamatan(rows: Record<string, unknown>[], kecamatan: string) {
  if (!kecamatan) return rows;
  const target = kecamatan.toLowerCase();

  return rows.filter((row) => {
    const flat = flattenRow(row);
    const names = [flat.kecamatan, flat.nama, flat["kecamatan.nama"]]
      .map((value) => String(value ?? "").toLowerCase());
    return names.some((name) => name.includes(target));
  });
}

function normalizeValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "ya" : "tidak";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(value).replace(/\s+/g, " ").trim().slice(0, 700);
}

function findKecamatan(question: string): string {
  return (
    KECAMATAN_NAMES.sort((a, b) => b.length - a.length).find((name) =>
      question.includes(name.toLowerCase()),
    ) ?? ""
  );
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

async function fallbackContext(): Promise<string> {
  const fallback =
    "Database jember_siaga berisi data cuaca, laporan bencana, peringatan dini, pos pengungsian, kontak darurat, FAQ, dan berita Jember Siaga.";

  try {
    const filePath = path.join(process.cwd(), "..", "analisis_database_jember_siaga.md");
    const text = await readFile(filePath, "utf8");
    return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, "").slice(0, 12000);
  } catch {
    return fallback;
  }
}

function buildMessages(question: string, history: ChatMessage[], context: string): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "Kamu adalah Jesi, asisten virtual Jember Siaga yang ramah, hangat, dan helpful banget! 😊\n" +
        "Gaya bicaramu santai tapi tetap informatif — seperti teman yang bantu warga soal kebencanaan Jember.\n" +
        "ATURAN SANGAT PENTING:\n" +
        "- KAMU WAJIB menjawab pertanyaan dengan MEMBACA DAN MENYIMPULKAN DATA dari 'Konteks database' di bawah.\n" +
        "- Data cuaca saat ini / cuaca terkini (cuaca realtime) bersumber langsung dari tabel `cuaca_realtime`.\n" +
        "- Data prakiraan / prediksi cuaca bersumber langsung dari tabel `perkiraan_cuaca` yang menyediakan data prakiraan jam-jaman hingga 3 hari ke depan.\n" +
        "- JANGAN PERNAH menyuruh pengguna untuk mengecek halaman/menu/website lain. Jawablah langsung di sini berdasarkan data yang ada!\n" +
        "- Jika ditanya tentang 'keseluruhan' Kabupaten Jember, berikan RINGKASAN umum (misal: rata-rata cuaca, kondisi mayoritas, dll) dari data kecamatan yang ada di konteks.\n" +
        "- Jawab dengan bahasa yang mudah dipahami, hangat, and ramah. Boleh pakai emoji.\n" +
        "- Berikan penjelasan yang cukup detail namun tetap pada intinya (jangan bertele-tele).\n" +
        "- Langsung ke inti, jangan mengulang pertanyaan pengguna.\n" +
        "- Kalau darurat, sebut 112 di awal!\n" +
        "- Jika data benar-benar kosong di 'Konteks database', barulah katakan data belum tersedia.\n" +
        "- JANGAN tampilkan password, token, email, atau data sensitif apapun.\n\n" +
        `Data terkini:\n${context}`,
    },
    ...history,
    { role: "user", content: question },
  ];
}

/**
 * When all Groq API models are rate-limited, extract key facts from the raw
 * DB context string and return a helpful Indonesian language response.
 */
function buildContextBasedFallback(question: string, context: string, _error: string): string {
  const q = question.toLowerCase();

  if (context && context.length > 50) {
    // Extract useful data from context lines
    const lines = context.split("\n").filter((l) => l.startsWith("- "));
    const weatherLines = lines.filter(
      (l) => l.includes("suhu") || l.includes("deskripsi_cuaca") || l.includes("deskripsi:") || l.includes("curah_hujan"),
    );
    const warningLines = lines.filter(
      (l) => l.includes("tingkat_urgensi") || l.includes("kritis") || l.includes("tinggi"),
    );

    if (hasAny(q, ["cuaca", "suhu", "hujan", "prediksi", "prakiraan"]) && weatherLines.length > 0) {
      const sample = weatherLines.slice(0, 4).join("\n");
      return `📊 Berdasarkan data terkini:\n${sample}\n\n_Data diambil langsung dari database Jember Siaga._`;
    }

    if (hasAny(q, ["peringatan", "siaga", "darurat", "bahaya"]) && warningLines.length > 0) {
      return `⚠️ Peringatan dini aktif:\n${warningLines.slice(0, 3).join("\n")}`;
    }

    if (context.length > 100) {
      return `ℹ️ Data tersedia di sistem:\n${lines.slice(0, 3).join("\n")}\n\n_Mohon maaf, layanan AI sedang penuh. Coba lagi dalam beberapa menit ya!_ 🙏`;
    }
  }

  // Absolute last resort
  if (hasAny(q, ["kontak", "darurat", "112", "bencana"])) {
    return "🆘 Nomor darurat: **112** (bebas pulsa, 24 jam). Segera hubungi jika ada bencana!";
  }
  return "Mohon maaf, layanan AI Jesi sedang penuh saat ini. Silakan coba kembali dalam beberapa menit. 🙏";
}
