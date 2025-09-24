<template>
  <form @submit.prevent="handleSubmit" class="form">
    <h2>Application yuborish</h2>

    <div class="row">
      <label>First name</label>
      <input v-model="form.first_name" type="text" required />
    </div>

    <div class="row">
      <label>Last name</label>
      <input v-model="form.last_name" type="text" required />
    </div>

    <div class="row">
      <label>Father name</label>
      <input v-model="form.father_name" type="text" required />
    </div>

    <div class="row">
      <label>Birth date</label>
      <input v-model="form.birth_date" type="date" />
    </div>

    <div class="row">
      <label>Phone</label>
      <input v-model="form.phone" type="tel" required />
    </div>

    <div class="row">
      <label>Address</label>
      <input v-model="form.address" type="text" />
    </div>

    <hr />

    <h3>Passport ma'lumotlari</h3>
    <div class="row">
      <label>Series</label>
      <input v-model="form.series" type="text" required />
    </div>

    <div class="row">
      <label>Number</label>
      <input v-model="form.number" type="text" required />
    </div>

    <div class="row">
      <label>JSHSHIR (jsshir)</label>
      <input v-model="form.jsshir" type="text" required />
    </div>

    <div class="row">
      <label>Passport images (old & orqa) — 2 ta rasm</label>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="onFilesChange"
      />
      <p class="muted">Iltimos 2 ta rasm yuklang: front va back (yoki ikki tomonlama)</p>
    </div>

    <div v-if="previews.length" class="previews">
      <div v-for="(p, i) in previews" :key="i" class="preview">
        <img :src="p" alt="preview" />
      </div>
    </div>

    <div class="actions">
      <button :disabled="isUploading" type="submit">
        {{ isUploading ? `Yuklanmoqda (${progress}%)` : "Yuborish" }}
      </button>
      <button type="button" @click="resetForm" :disabled="isUploading">Tozalash</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
  </form>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";

const fileInput = ref(null);

const form = reactive({
  first_name: "",
  last_name: "",
  father_name: "",
  birth_date: "",
  phone: "",
  address: "",
  // passport fields (will be sent as top-level keys expected by backend)
  series: "",
  number: "",
  jsshir: "",
});

const files = ref([]); // File objects
const previews = ref([]); // dataURL previews

const isUploading = ref(false);
const progress = ref(0);
const error = ref("");
const success = ref("");

function onFilesChange(e) {
  const chosen = Array.from(e.target.files || []);
  // limit to 2 files
  if (chosen.length > 2) {
    error.value = "Iltimos faqat 2 ta rasm yuboring (old va orqa).";
    // keep only first two
    chosen.splice(2);
  } else {
    error.value = "";
  }

  files.value = chosen;

  // generate previews
  previews.value = [];
  chosen.forEach((f) => {
    const reader = new FileReader();
    reader.onload = (ev) => previews.value.push(ev.target.result);
    reader.readAsDataURL(f);
  });
}

function validateBeforeSend() {
  // Basic validation
  if (!form.first_name || !form.last_name || !form.phone) {
    error.value = "Iltimos ism, familya va telefonni kiriting.";
    return false;
  }
  if (!form.series || !form.number || !form.jsshir) {
    error.value = "Iltimos passport ma'lumotlarini to'liq kiriting.";
    return false;
  }
  if (files.value.length === 0) {
    error.value = "Iltimos passport uchun 2 ta rasm yuboring.";
    return false;
  }
  // allow 1 or 2 files, but prefer 2
  if (files.value.length > 2) {
    error.value = "Maksimum 2 ta rasm yuborish mumkin.";
    return false;
  }
  return true;
}

async function handleSubmit() {
  error.value = "";
  success.value = "";
  if (!validateBeforeSend()) return;

  const fd = new FormData();

  // append basic fields
  fd.append("first_name", form.first_name);
  fd.append("last_name", form.last_name);
  fd.append("father_name", form.father_name);
  if (form.birth_date) fd.append("birth_date", form.birth_date);
  fd.append("phone", form.phone);
  if (form.address) fd.append("address", form.address);

  // passport fields — backend expects top-level keys (series, number, jsshir)
  fd.append("series", form.series);
  fd.append("number", form.number);
  fd.append("jsshir", form.jsshir);

  // append files under the same field name expected by multer: "passportImage"
  files.value.forEach((f) => {
    fd.append("passportImage", f); // note: append multiple with same field name
  });

  try {
    isUploading.value = true;
    progress.value = 0;

    const res = await axios.post("/applications", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          progress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        }
      },
    });
console.log(res);

    success.value = "Application muvaffaqiyatli yuborildi.";
    // agar backend fayl nomlarini yuborsa, ko'rsatish mumkin:
    // success.value = `Saved: ${res.data.data._id || 'ok'}`;
    resetForm();
  } catch (err) {
    console.error(err);
    if (err.response && err.response.data && err.response.data.error) {
      error.value = err.response.data.error;
    } else {
      error.value = "Serverga ulanishda xatolik yuz berdi.";
    }
  } finally {
    isUploading.value = false;
    progress.value = 0;
  }
}

function resetForm() {
  form.first_name = "";
  form.last_name = "";
  form.father_name = "";
  form.birth_date = "";
  form.phone = "";
  form.address = "";
  form.series = "";
  form.number = "";
  form.jsshir = "";

  files.value = [];
  previews.value = [];
  if (fileInput.value) fileInput.value.value = "";
  error.value = "";
  success.value = "";
}
</script>

<style scoped>
.form {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
}
.row {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.row label {
  font-weight: 600;
  margin-bottom: 6px;
}
.row input[type="text"],
.row input[type="tel"],
.row input[type="date"],
.row input[type="file"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #2b6cb0;
  color: white;
  cursor: pointer;
}
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
.previews {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.preview img {
  width: 140px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.muted {
  color: #666;
  font-size: 12px;
}
.error {
  margin-top: 10px;
  color: #b91c1c;
}
.success {
  margin-top: 10px;
  color: #15803d;
}
</style>
