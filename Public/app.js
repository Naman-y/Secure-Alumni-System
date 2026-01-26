const API = "http://localhost:3000";
let userEmail = "";

/* ---------------- AUTH UI TOGGLE ---------------- */
function showRegister() {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
  otpBox.style.display = "none";
}

function showLogin() {
  loginBox.style.display = "block";
  registerBox.style.display = "none";
  otpBox.style.display = "none";
}

/* ---------------- REGISTER ---------------- */
async function register() {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
  });

  const data = await res.json();
  msg.innerText = data.message;
  showLogin();
}

/* ---------------- LOGIN ---------------- */
async function login() {
  userEmail = loginEmail.value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
    })
  });

  const data = await res.json();
  msg.innerText = data.message;
  otpBox.style.display = "block";
}

/* ---------------- OTP VERIFY ---------------- */
async function verifyOtp() {
  const res = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: userEmail,
      otp: otp.value
    })
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);

  const payload = JSON.parse(atob(data.token.split(".")[1]));

  if (payload.role === "ADMIN") location.href = "admin.html";
  if (payload.role === "ALUMNI") location.href = "alumni.html";
  if (payload.role === "STAFF") location.href = "staff.html";
}

/* ---------------- ADMIN: UPLOAD ---------------- */
async function uploadTranscript() {
  const token = localStorage.getItem("token");

  if (!file.files[0]) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file.files[0]);

  const res = await fetch("http://localhost:3000/transcript/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    body: formData
  });

  const data = await res.json();

  document.getElementById("status").innerText = data.message;
  document.getElementById("hash").value = data.hash;
  document.getElementById("signature").value = data.signature;
}


/* ---------------- ALUMNI: DOWNLOAD ---------------- */
async function downloadTranscript() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again");
    location.href = "auth.html";
    return;
  }

  const res = await fetch("http://localhost:3000/transcript/download", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("msg").innerText = data.message;
    return;
  }

  document.getElementById("msg").innerText = data.message;
  document.getElementById("base64").value = data.base64File;
}

/* ---------------- ALUMNI: DOWNLOAD ORIGINAL---------------- */
async function downloadOriginal() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/transcript/download-file", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  if (!res.ok) {
    alert("Download failed");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transcript.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------------- Verify Transcript ---------------- */
async function verifyTranscript() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/transcript/verify", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();
  document.getElementById("result").innerText = data.message;
}


/* ---------------- LOGOUT ---------------- */
function logout() {
  localStorage.removeItem("token");
  location.href = "auth.html";
}
