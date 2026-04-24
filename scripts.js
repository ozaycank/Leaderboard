(function () {
  // DOM Elemanları
  const form = document.getElementById("playerForm");
  const playersContainer = document.getElementById("players");
  const fields = ["firstName", "lastName", "country", "score"];

  // STATE (Uygulamanın Hafızası)
  // Tüm oyuncuları bu dizide tutacağız ki istediğimiz zaman sıralayabilelim.
  let playersList = [];

  //HATA MESAJI GÖSTERİMİ
  const showFieldMessage = (el) => {
    const msgEl = document.querySelector(`.required-msg[data-for="${el.id}"]`);
    if (!msgEl) return;

    if (!el.checkValidity()) {
      if (el.validity.valueMissing)
        msgEl.textContent = "This field is required";
      else if (el.validity.typeMismatch) msgEl.textContent = "Invalid value";
      else if (el.validity.rangeUnderflow)
        msgEl.textContent = "Value cannot be negative";
      else msgEl.textContent = "Invalid input";
    } else {
      msgEl.textContent = "";
    }
  };

  // Her input için anlık (input) ve odaktan çıkma (blur) kontrolleri
  fields.forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => showFieldMessage(el));
    el.addEventListener("blur", () => showFieldMessage(el));
  });

  /**
   * 2. YARDIMCI FONKSİYONLAR
   */
  const formatDate = (d) =>
    `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;

  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  /**
   * 3. EKRANA ÇİZME (RENDER) İŞLEMİ
   * Tüm listeyi temizler, puana göre sıralar ve baştan çizer.
   */
  const renderPlayers = () => {
    playersContainer.innerHTML = ""; // Ekranı temizle

    // Büyükten küçüğe sırala (Sorting)
    playersList.sort((a, b) => b.score - a.score);

    playersList.forEach((player) => {
      // HTML metnini oluştur (Backtick ` kullanımı ile çok daha okunaklı)
      const htmlString = `
                <div class="player" data-id="${player.id}">
                    <div class="player-info">
                        <span class="player-name">${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</span>
                        <span class="player-meta">${escapeHtml(player.country)} • ${escapeHtml(player.addedAt)}</span>
                    </div>
                    <div class="player-actions">
                        <span class="player-score">${player.score}</span>
                        <button class="small-btn btn-plus">+5</button>
                        <button class="small-btn btn-minus">-5</button>
                        <button class="small-btn btn-delete">X</button>
                    </div>
                </div>
            `;
      // Oluşturulan HTML'i container'a ekle
      playersContainer.insertAdjacentHTML("beforeend", htmlString);
    });
  };

  //EVENT DELEGATION

  playersContainer.addEventListener("click", (e) => {
    // Tıklanan şey bir buton değilse işlemi iptal et
    const btn = e.target.closest("button");
    if (!btn) return;

    // Tıklanan butonun hangi oyuncuya ait olduğunu ID'sinden bul
    const playerDiv = btn.closest(".player");
    const playerId = playerDiv.dataset.id;

    // Oyuncuyu dizide bul
    const playerIndex = playersList.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return;

    // İşlemleri Yap
    if (btn.classList.contains("btn-plus")) {
      playersList[playerIndex].score += 5;
    } else if (btn.classList.contains("btn-minus")) {
      playersList[playerIndex].score -= 5;
      if (playersList[playerIndex].score < 0)
        playersList[playerIndex].score = 0; // Eksiye düşmeyi engelle
    } else if (btn.classList.contains("btn-delete")) {
      playersList.splice(playerIndex, 1); // Diziden sil
    }

    // Veri değişti, ekranı yeniden çiz (böylece otomatik sıralanacak)
    renderPlayers();
  });

  /**
   * 5. FORM GÖNDERME (SUBMIT)
   */
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini durdur

    let valid = true;
    const data = {};

    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (!el.checkValidity()) {
        valid = false;
        showFieldMessage(el);
      }
      data[id] = el.value.trim();
    });

    if (!valid) return;

    // Yeni oyuncu objesi
    const newPlayer = {
      id: Date.now().toString(), // Silme/Güncelleme işlemleri için benzersiz kimlik
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
      score: Number(data.score),
      addedAt: formatDate(new Date()),
    };

    // Oyuncuyu diziye ekle ve ekranı çiz
    playersList.push(newPlayer);
    renderPlayers();

    // Formu temizle ve ilk inputa odaklan
    form.reset();
    fields.forEach(
      (id) =>
        (document.querySelector(`.required-msg[data-for="${id}"]`).textContent =
          ""),
    );
    document.getElementById("firstName").focus();
  });
})();
