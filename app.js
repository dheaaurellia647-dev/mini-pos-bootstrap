
let produk = JSON.parse(localStorage.getItem("produk")) || [];
let keranjang = [];
let riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];

const rupiah = angka =>
  "Rp " + angka.toLocaleString("id-ID");

function simpan() {
  localStorage.setItem("produk", JSON.stringify(produk));
  localStorage.setItem("riwayat", JSON.stringify(riwayat));
}

function tampilkan() {
  const daftar = document.getElementById("daftarProduk");
  daftar.innerHTML = "";

  produk.forEach((p, i) => {
    let status = p.stok === 0
      ? "bg-danger"
      : p.stok < 5
      ? "bg-warning text-dark"
      : "bg-success";

    daftar.innerHTML += `
      <div class="col-md-6">
        <div class="card product-card p-3">
          <h6>${p.nama}</h6>
          <p class="price">${rupiah(p.harga)}</p>
          <span class="badge ${status}">
            Stok: ${p.stok}
          </span>
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-primary btn-sm"
              ${p.stok === 0 ? "disabled" : ""}
              onclick="beli(${i})">
              Beli
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="hapus(${i})">
              Hapus
            </button>
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById("omzet").textContent =
    rupiah(riwayat.reduce((a, b) => a + b.total, 0));

  document.getElementById("totalStok").textContent =
    produk.reduce((a, b) => a + b.stok, 0);

  document.getElementById("transaksi").textContent =
    riwayat.length;
}

document.getElementById("formProduk").onsubmit = function(e) {
  e.preventDefault();

  produk.push({
    nama: document.getElementById("nama").value,
    harga: Number(document.getElementById("harga").value),
    stok: Number(document.getElementById("stok").value)
  });

  simpan();
  tampilkan();
  this.reset();
};

function beli(i) {
  if (produk[i].stok <= 0) return;

  let item = keranjang.find(x => x.index === i);

  if (item) {
    if (item.jumlah >= produk[i].stok) {
      alert("Stok tidak mencukupi!");
      return;
    }
    item.jumlah++;
  } else {
    keranjang.push({
      index: i,
      nama: produk[i].nama,
      harga: produk[i].harga,
      jumlah: 1
    });
  }

  tampilkanKeranjang();
}

function hapus(i) {
  produk.splice(i, 1);
  keranjang = keranjang.filter(x => x.index !== i);
  simpan();
  tampilkan();
  tampilkanKeranjang();
}

function hitungTotal() {
  return keranjang.reduce(
    (total, item) => total + item.harga * item.jumlah, 0
  );
}

function tampilkanKeranjang() {
  let area = document.getElementById("keranjang");
  area.innerHTML = "";

  keranjang.forEach(item => {
    area.innerHTML += `
      <div class="d-flex justify-content-between mb-2">
        <span>${item.nama} x ${item.jumlah}</span>
        <b>${rupiah(item.harga * item.jumlah)}</b>
      </div>
    `;
  });

  document.getElementById("total").textContent =
    rupiah(hitungTotal());

  hitungKembalian();
}

document.getElementById("uang").oninput = hitungKembalian;

function hitungKembalian() {
  let total = hitungTotal();
  let uang = Number(document.getElementById("uang").value);

  document.getElementById("kembalian").textContent =
    rupiah(Math.max(0, uang - total));
}

document.getElementById("bayar").onclick = function() {
  if (keranjang.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  let total = hitungTotal();
  let metode = document.getElementById("metode").value;
  let uang = Number(document.getElementById("uang").value);

  if (metode === "Tunai" && uang < total) {
    alert("Uang pembayaran masih kurang!");
    return;
  }

  let pembelian = [...keranjang];

  pembelian.forEach(item => {
    produk[item.index].stok -= item.jumlah;
  });

  riwayat.push({
    total: total,
    tanggal: new Date().toLocaleString("id-ID")
  });

  document.getElementById("isiNota").innerHTML = `
    <p>Tanggal: ${new Date().toLocaleString("id-ID")}</p>
    ${pembelian.map(item =>
      `<p>${item.nama} x ${item.jumlah} = ${rupiah(item.harga * item.jumlah)}</p>`
    ).join("")}
    <hr>
    <p>Total: ${rupiah(total)}</p>
    <p>Metode: ${metode}</p>
    <p>Bayar: ${metode === "Tunai" ? rupiah(uang) : "-"}</p>
    <p>Kembalian: ${metode === "Tunai" ? rupiah(uang-total) : "-"}</p>
    <h5>Terima kasih!</h5>
  `;

  document.getElementById("receipt").hidden = false;

  keranjang = [];
  document.getElementById("uang").value = "";

  simpan();
  tampilkan();
  tampilkanKeranjang();

  alert("Transaksi berhasil!");
};

tampilkan();
tampilkanKeranjang();

