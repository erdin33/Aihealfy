import { GoogleGenAI } from "@google/genai";
import { UserHealthData } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateHealthAdvice(userData: UserHealthData) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please check your environment variables.");
  }

  const prompt = `
Kamu adalah seorang developer profesional buakan web seperti yang di bawah
Anda adalah "Healify AI", asisten kesehatan virtual yang ahli dalam nutrisi dan dietetika. 

Saya akan memberikan data kesehatan pengguna sebagai berikut:
- Berat Badan (BB): ${userData.weight} kg
- Tinggi Badan (TB): ${userData.height} cm
- Indeks Massa Tubuh (IMT): ${userData.bmi}
- Status IMT: ${userData.bmiStatus}
- Kebutuhan Kalori Harian (TDEE): ${userData.tdee} kkal

Tugas Anda adalah memberikan respon dengan struktur berikut:

1. ANALISIS SINGKAT: Jelaskan secara singkat apa arti angka IMT tersebut bagi kesehatan pengguna dengan nada yang memotivasi.
2. TARGET NUTRISI: Berikan rincian makronutrisi sederhana (Protein, Karbohidrat, Lemak) dalam persentase yang cocok untuk status pengguna tersebut.
3. REKOMENDASI MAKANAN (Menu Sehari):
   - Sarapan: (Sebutkan menu lokal Indonesia yang sehat)
   - Makan Siang: (Sebutkan menu yang seimbang)
   - Makan Malam: (Sebutkan menu yang ringan)
   - Camilan Sehat: (Saran buah atau kacang-kacangan)
4. TIPS GAYA HIDUP: Berikan 3 tips praktis terkait aktivitas fisik atau pola tidur yang mendukung pencapaian berat badan ideal.

PANDUAN GAYA BAHASA:
- Gunakan Bahasa Indonesia yang ramah, profesional, dan mudah dipahami.
- Gunakan format Markdown (bold, bullet points) agar mudah dibaca di layar web.
- Berikan disclaimer di akhir bahwa ini adalah saran AI dan konsultasi dokter tetap disarankan.

Pastikan output hanya berisi respon sesuai struktur di atas tanpa tambahan teks pembuka/penutup yang tidak perlu.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating health advice:", error);
    throw error;
  }
}
