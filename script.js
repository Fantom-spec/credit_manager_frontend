// ==========================
// CONFIG
// ==========================

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://credit-manager-backend.onrender.com"; // <-- CHANGE THIS

let latestAmount = 0;

function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // Update pages
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
}
// ==========================
// TOAST
// ==========================

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}


// ==========================
// CALCULATE
// ==========================

function calculate() {
  const credits = parseFloat(document.getElementById('credits-sold').value);
  const discount = parseFloat(document.getElementById('discount-amount').value);

  const resultBox = document.getElementById('result-box');
  const resultVal = document.getElementById('result-value');

  if (isNaN(credits) || credits <= 0) {
    resultVal.textContent = 'Enter valid credits';
    resultVal.className = 'result-value empty';
    resultBox.classList.remove('has-value');
    return;
  }

  fetch(`${API_BASE}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      credits: credits,
      discount: discount || 0
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Calculation failed");
    return res.json();
  })
  .then(data => {
    latestAmount = parseFloat(data.final_amount);

    resultVal.textContent = '₹' + latestAmount.toFixed(2);
    resultVal.className = 'result-value';
    resultBox.classList.add('has-value');
  })
  .catch(err => {
    alert("Server error");
    console.error(err);
  });
}


// ==========================
// POPUP
// ==========================

function openPopup() {
  if (!latestAmount || latestAmount <= 0) {
    alert("Calculate amount first");
    return;
  }

  generateQR();
  document.getElementById('popup').classList.add('open');
}

function closePopup() {
  document.getElementById('popup').classList.remove('open');
}


// ==========================
// GENERATE QR
// ==========================

function generateQR() {
  if (!latestAmount || latestAmount <= 0) return;

  const qrImage = document.getElementById('qrcode');
  qrImage.src = "";

  fetch(`${API_BASE}/generate_qr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      latest_amount: latestAmount
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("QR generation failed");
    return res.json();
  })
  .then(data => {
    qrImage.src = "data:image/png;base64," + data.qr_image;
  })
  .catch(err => {
    alert("QR generation failed");
    console.error(err);
  });
}


// ==========================
// SELL
// ==========================

function goHome() {
  const credits = parseFloat(document.getElementById('credits-sold').value);
  const discount = parseFloat(document.getElementById('discount-amount').value);

  if (!credits || credits <= 0) return;

  fetch(`${API_BASE}/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      credits: credits,
      discount: discount || 0,
      final_amount: latestAmount
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Sell failed");
    return res.json();
  })
  .then(data => {
    showToast();
    console.log(data);
  })
  .catch(err => {
    alert("Sell failed");
    console.error(err);
  });

  // Reset UI
  document.getElementById('credits-sold').value = '';
  document.getElementById('discount-amount').value = '';
  document.getElementById('result-value').textContent = '—';
  document.getElementById('result-value').className = 'result-value empty';
  document.getElementById('result-box').classList.remove('has-value');
  latestAmount = 0;

  closePopup();
}


// ==========================
// REDEEM
// ==========================

function redeemCredits() {
  const used = parseFloat(document.getElementById('credits-used').value);
  const meal = document.getElementById('meal_type').value;

  if (!used || used <= 0) return;

  fetch(`${API_BASE}/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      credits_used: used,
      meal_time: meal
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Redeem failed");
    return res.json();
  })
  .then(data => {
    showToast();
    console.log(data);
  })
  .catch(err => {
    alert("Redeem failed");
    console.error(err);
  });

  document.getElementById('credits-used').value = '';
  document.getElementById('meal_type').value = '';
}


// ==========================
// CLOSE POPUP ON OUTSIDE CLICK
// ==========================

document.getElementById('popup').addEventListener('click', function(e) {
  if (e.target === this) closePopup();
});

// ==========================
// PROGRESS BAR
// ==========================

function setProgress(val){
  document.querySelector(".progress-fill").style.width = val + "%";
  document.querySelector(".progress-text").textContent = val + "%";
}

function updateReport() {

  const resultBoxUsed = document.getElementById('result-box-used');
  const resultBoxSold = document.getElementById('result-box-sold');
  const resultBoxLeft = document.getElementById('result-box-left');
  const resultUsed = document.getElementById('result-used');
  const resultSold = document.getElementById('result-sold');
  const resultLeft = document.getElementById('result-left');
  fetch(`${API_BASE}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      button:"report_needed"
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Redeem failed");
    return res.json();
  })
  .then(data => {
    resultUsed.textContent = '₹' + data.used;
    resultUsed.className = 'result-used';
    resultBoxUsed.classList.add('has-value');

    resultSold.textContent = '₹' + data.sold;
    resultSold.className = 'result-sold';
    resultBoxSold.classList.add('has-value');

    resultLeft.textContent = '₹' + data.left;
    resultLeft.className = 'result-left';
    resultBoxLeft.classList.add('has-value');
  })
  .catch(err => {
    alert("failed");
    console.error(err);
  });
}



setProgress(0);