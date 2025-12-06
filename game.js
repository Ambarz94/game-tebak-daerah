let map = L.map("map", {
  zoomControl: true,
  attributionControl: false
}).setView([-2.5, 117], 5);

// ❌ Tidak memakai OpenStreetMap

let geoLayer;
let targetName = "";
let answered = false;

// Menyimpan daerah yang sudah dijawab benar
let correctAreas = new Set();

// --------------------
// Load GeoJSON
// --------------------
fetch("daerah.geojson")
  .then(res => res.json())
  .then(data => {
    geoLayer = L.geoJSON(data, {
      style: {
        color: "#333",
        weight: 1,
        fillColor: "#eee",
        fillOpacity: 0.7
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", () => {
          if (answered) return;

          let name = feature.properties.nama || feature.properties.NAMOBJ;

          if (name === targetName) {
            // Jawaban benar → hijau permanen
            layer.setStyle({ fillColor: "green", fillOpacity: 0.8 });

            // Simpan agar tidak direset
            correctAreas.add(name);

            alert("Benar! 🎉 Ini adalah " + targetName);

            answered = true;

            setTimeout(() => {
              newQuestion();
            }, 1500);

          } else {
            // Jawaban salah → merah sementara
            layer.setStyle({ fillColor: "red", fillOpacity: 0.8 });

            alert("Salah! 😅 Tadi disuruh cari: " + targetName);

            answered = true;

            setTimeout(() => {
              resetUnanswered();
              newQuestion();
            }, 1500);
          }
        });
      }
    }).addTo(map);

    // Zoom otomatis sesuai batas geojson
    map.fitBounds(geoLayer.getBounds());

    newQuestion();
  });

// --------------------
// Reset hanya yang salah
// --------------------
function resetUnanswered() {
  geoLayer.eachLayer(layer => {
    let name = layer.feature.properties.nama || layer.feature.properties.NAMOBJ;

    // Jika sudah benar → jangan reset (agar tetap hijau)
    if (correctAreas.has(name)) return;

    // reset area lain
    geoLayer.resetStyle(layer);
  });
}

// --------------------
// New Question
// --------------------
function newQuestion() {
  answered = false;

  let list = geoLayer.toGeoJSON().features;

  // Cari pertanyaan yang belum benar
  let remaining = list.filter(f => {
    let nm = f.properties.nama || f.properties.NAMOBJ;
    return !correctAreas.has(nm);
  });

  // Jika semua sudah hijau
  if (remaining.length === 0) {
    document.getElementById("question").innerText =
      "🎉 Semua daerah sudah benar! Game selesai!";
    return;
  }

  // Random daerah yang belum benar
  let random = remaining[Math.floor(Math.random() * remaining.length)];

  targetName = random.properties.nama || random.properties.NAMOBJ;

  document.getElementById("question").innerText =
    "Tebak daerah: " + targetName;
}
