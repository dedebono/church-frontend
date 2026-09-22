// Fallback and cached data for offline/network error scenarios

export const initialEvents = [
  {
    _id: "6881e1dcf3bbc855e3308796",
    title: "SEMINAR KEBENARAN",
    preacher: "Ps Johni Batubara",
    date: "2025-07-31T00:00:00.000Z",
    time: "19:00",
    description: "Seminar Kebenaran Firman Tuhan untuk memperkuat iman jemaat.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/event_images%2F1753342405835_Ibadah%20umum2.png?alt=media&token=61dcb15c-c464-41fa-83dd-d1dacfa94bae",
  },
  {
    _id: "688ad9d715364a99cfbc1791",
    title: "Seminar Dewasa Muda",
    preacher: "Ps. Ronny Runtukahu",
    date: "2025-07-30T00:00:00.000Z",
    time: "19:00",
    description: "Membangun generasi muda yang tangguh dan berakar dalam Kristus.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/event_images%2F1753930187524_Doa%20malam%20(16).png?alt=media&token=4c8fec80-58ef-47f7-b31d-57c520cb3f8e",
  },
];

export const initialSermons = [
  {
    _id: "6864be21f59a221edf1e1c27",
    title: "Doa Pagi",
    preacher: "Ps. Henky Budi",
    date: "2025-07-25T00:00:00.000Z",
    description: "Ibadah Doa Pagi bersama jemaat",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/sermon_images%2F1751432727566_pengumuman%20banner.png?alt=media&token=38aa0dd8-dd36-408c-a866-02f25eb5e924",
    audioUrl: "https://example.com/audio.mp3",
  },
  {
    _id: "6864c76562843cadce423217",
    title: "Doa Malam 2",
    preacher: "Ps. Braniman",
    date: "2025-07-03T00:00:00.000Z",
    time: "19:01",
    description: "Ibadah Doa Malam",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/sermon_images%2F1751434356882_Doa%20malam%20(4).jpg?alt=media&token=f32f45b5-23c0-45d8-815b-ced03fe4c539",
    audioUrl: "https://example.com/audio.mp3",
  },
];

export const initialGallery = [
  {
    _id: "6868720ae43e30d6507ba267",
    title: "MLB Teens",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/gallery%2F1751675391739_WhatsApp%20Image%202025-06-07%20at%2019.47.22.jpeg?alt=media&token=56c25e75-e864-494d-a9e7-3cb294ea0a8e",
    description: "Kebersamaan dan sukacita remaja MLB Teens",
    tags: ["MLB Teens"],
    category: "MLB Teens",
    date: "2025-07-05T00:30:02.591Z",
  },
  {
    _id: "686871e6e43e30d6507ba263",
    title: "Family Gathering 2025",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/gallery%2F1751675360238_WhatsApp%20Image%202025-05-31%20at%2023.02.03.jpeg?alt=media&token=315256ee-4387-4c39-a651-6535c8a39fcf",
    description: "Perjumpaan keluarga besar gereja tahun 2025",
    tags: ["Family Gathering"],
    category: "Family Gathering 2025",
    date: "2025-07-05T00:29:26.170Z",
  },
  {
    _id: "68672a39bcb21a8f00f0d2c0",
    title: "Deepcell Strong Family",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/gallery%2F1751591405960_WhatsApp%20Image%202025-06-28%20at%2021.08.43.jpeg?alt=media&token=11c70ef9-df64-444f-91f4-50fdb5d768d7",
    description: "Persekutuan Deepcell Strong Family",
    tags: ["Deepcell"],
    category: "Deepcell",
    date: "2025-07-04T01:11:21.767Z",
  },
];

export const getCachedOrFallback = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return fallback;
};

export const setCacheData = (key, data) => {
  try {
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    }
  } catch (e) {
    // ignore
  }
};
