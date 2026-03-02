// ==========================
// CONFIG
// ==========================

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://your-backend-name.onrender.com"; // <-- CHANGE THIS

let latestAmount = 0;


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

  if (!used || used <= 0) return;

  fetch(`${API_BASE}/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      credits_used: used
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
}


// ==========================
// CLOSE POPUP ON OUTSIDE CLICK
// ==========================

document.getElementById('popup').addEventListener('click', function(e) {
  if (e.target === this) closePopup();
});