let map = L.map("map", { zoomControl: true, attributionControl: false }).setView([-6.32, 107.31], 12);

let geoLayer;
let targetName = "";
let answered = false;
let answeredDesa = new Set();

let pilihKec = document.getElementById("pilihKecamatan");
let resetBtn = document.getElementById("resetBtn");

fetch("daerah.geojson")
  .then(res => res.json())
  .then(data => {

    // ===========================
    // LOAD GEOJSON
    // ===========================
    geoLayer = L.geoJSON(data, {
      style: { color: "#555", weight: 1, fillColor: "#ccc", fillOpacity: 0.6 },
      onEachFeature: (feature, layer) => {
        layer.on("click", () => {
          if (!targetName || answeredDesa.has(feature.properties.WADMKD)) return;

          if (feature.properties.WADMKD === targetName) {
            layer.setStyle({ fillColor: "green", fillOpacity: 0.8 });
            alert("Benar! 🎉 " + targetName);
            answeredDesa.add(targetName);
          } else {
            layer.setStyle({ fillColor: "red", fillOpacity: 0.8 });
            alert("Salah! 😅 Cari: " + targetName);
          }

          answered = true;

          // cek apakah semua desa di kecamatan sudah ditebak
          let semuaDesa = data.features.filter(f => f.properties.WADMKC === pilihKec.value).map(f => f.properties.WADMKD);
          let belum = semuaDesa.filter(d => !answeredDesa.has(d));
          if (belum.length > 0) {
            // pilih desa berikutnya secara acak
            targetName = belum[Math.floor(Math.random() * belum.length)];
            document.getElementById("question").innerText = "Klik desa: " + targetName;
          } else {
            document.getElementById("question").innerText = "🎉 Semua desa sudah ditebak!";
            targetName = "";
          }
        });
      }
    }).addTo(map);

    map.fitBounds(geoLayer.getBounds());

    // ===========================
    // ISI DROPDOWN KECAMATAN
    // ===========================
    let kecSet = new Set();
    data.features.forEach(f => kecSet.add(f.properties.WADMKC));
    kecSet.forEach(k => {
      let opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      pilihKec.appendChild(opt);
    });

    // ===========================
    // EVENT: KECAMATAN DIPILIH
    // ===========================
    pilihKec.addEventListener("change", () => {
  let kec = pilihKec.value;
  answeredDesa.clear();
  targetName = "";

  // hapus semua layer dulu
  geoLayer.eachLayer(layer => map.removeLayer(layer));

  // tampilkan hanya desa di kecamatan yang dipilih
  geoLayer.eachLayer(layer => {
    if (layer.feature.properties.WADMKC === kec) {
      layer.setStyle({ fillOpacity: 0.6, fillColor: "#ccc", color: "#555", weight: 1 });
      layer.options.interactive = true;
      layer.addTo(map);
    }
  });

  // zoom ke kecamatan
  map.fitBounds(L.featureGroup(
    geoLayer.getLayers().filter(l => l.feature.properties.WADMKC === kec)
  ).getBounds());

  // pilih desa pertama secara acak
  let desaKec = geoLayer.getLayers().filter(l => l.feature.properties.WADMKC === kec).map(l => l.feature.properties.WADMKD);
  targetName = desaKec[Math.floor(Math.random() * desaKec.length)];

  document.getElementById("question").innerText = "Klik desa: " + targetName;
});

    // ===========================
    // BUTTON RESET
    // ===========================
    resetBtn.addEventListener("click", () => {
      pilihKec.value = "";
      targetName = "";
      answeredDesa.clear();
      document.getElementById("question").innerText = "Pilih kecamatan untuk mulai.";
      geoLayer.eachLayer(layer => {
        layer.setStyle({ fillOpacity: 0.6, fillColor: "#ccc", color: "#555", weight: 1 });
        layer.options.interactive = true;
      });
      map.fitBounds(geoLayer.getBounds());
    });

  });