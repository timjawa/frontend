const fs = require('fs');
const https = require('https');

const kecamatans = [
  "Kaliwates", "Sumbersari", "Patrang", "Tanggul", "Jombang", "Ambulu", 
  "Ajung", "Kalisat", "Rambipuji", "Balung", "Jelbuk", "Pakusari",
  "Puger", "Kencong", "Gumusari", "Kencong", "Tempurejo", "Sumberbaru", // Beberapa mock, jika gagal tak apa
  "Wuluhan", "Mayang", "Silo", "Mumbulsari", "Ledokombo", "Sukowono", 
  "Arjasa", "Panti", "Umbulsari"
];

async function fetchGeoJSON(name) {
  const url = `https://nominatim.openstreetmap.org/search?q=Kecamatan+${encodeURIComponent(name)},+Kabupaten+Jember&format=geojson&polygon_geojson=1`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ReactApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', (e) => resolve(null));
  });
}

// Menghindari rate limit Nominatim API (Maks 1 request per detik)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const features = [];
  for (const name of kecamatans) {
    try {
      const res = await fetchGeoJSON(name);
      if (res && res.features && res.features.length > 0) {
        const polygonFeature = res.features.find(f => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
        if (polygonFeature) {
          polygonFeature.properties = { name: name }; // Bersihkan properties
          features.push(polygonFeature);
          console.log(`OK: ${name}`);
        } else {
          console.log(`NO POLYGON: ${name}`);
        }
      } else {
        console.log(`NOT FOUND: ${name}`);
      }
    } catch(e) {
      console.log(`ERROR: ${name}`);
    }
    await sleep(1100); // Tunggu 1,1 detik setiap request menyesuaikan rules Nominatim
  }
  
  // Tentukan minimal ada yg danger/warning agar menarik
  const geojson = {
    type: "FeatureCollection",
    features: features.map((f, i) => {
        // Pseudo-random distribution of statuses
        let status = "safe";
        if (i % 4 === 1) status = "warning";
        else if (i % 7 === 3) status = "danger";
        
        f.properties.status = status;
        
        return f;
    })
  };
  fs.writeFileSync('public/kecamatan-jember.json', JSON.stringify(geojson, null, 2));
  console.log("SUKSES Menulis public/kecamatan-jember.json dengan " + features.length + " kecamatan.");
}

main();
