<template>
  <div class="application-login">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <img alt="Logo" src="../assets/logo_sharq blue.png" class="logo" />
          </div>
          <h1 class="login-title">
            <i class="fas fa-search"></i>
            Arizani tekshirish
          </h1>
          <p class="login-subtitle">
            Yuborgan arizangizning holatini bilish uchun JSHIR va telefon raqamingizni kiriting
          </p>
        </div>

        <form @submit.prevent="searchApplication" class="login-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-id-card"></i>
              JSHIR (Jismoniy shaxsning identifikatsiya raqami)
            </label>
            <input v-model="searchForm.passportJsshir" type="text" class="form-input"
              :class="{ 'error': errors.passportJsshir }" placeholder="12345678901234" maxlength="14"
              @input="formatJsshir" required />
            <div class="input-help">14 ta raqamdan iborat bo'lishi kerak</div>
            <div v-if="errors.passportJsshir" class="error-message">
              {{ errors.passportJsshir }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-phone"></i>
              Telefon raqami
            </label>
            <input v-model="searchForm.phone" type="tel" class="form-input" :class="{ 'error': errors.phone }"
              placeholder="+998 90 123 45 67" @input="formatPhoneNumber" required />
            <div class="input-help">+998 bilan boshlanuvchi format</div>
            <div v-if="errors.phone" class="error-message">
              {{ errors.phone }}
            </div>
          </div>
            <a class="input-help replace-url" href="/apply">Ariza topshirish</a>

          <button type="submit" class="search-btn" :disabled="!isFormValid || loading">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-search"></i>
            {{ loading ? 'Qidirilmoqda...' : 'Arizani qidirish' }}
          </button>
        </form>

        <div class="additional-info">
          <div class="info-item">
            <i class="fas fa-info-circle"></i>
            <span>Agar ma'lumotlaringizni unutgan bo'lsangiz, qo'llab-quvvatlash xizmatiga murojaat qiling</span>
          </div>

          <div class="contact-section">
            <a href="https://t.me/sharq_yotoqxona" target="_blank" class="contact-link">
              <i class="fab fa-telegram"></i>
              @sharq_yotoqxona 
            </a>
          </div>
        </div>
      </div>

      <!-- Application Found Section -->
      <div v-if="applicationFound" class="application-section">
        <div class="application-header">
          <h2>
            <i class="fas fa-file-alt"></i>
            Ariza ma'lumotlari
          </h2>
          <div class="status-badge" :class="`status-${applicationData.status}`">
            <i :class="getStatusIcon(applicationData.status)"></i>
            {{ getStatusText(applicationData.status) }}
          </div>
        </div>

        <!-- Application Form (Disabled) -->
        <form class="application-form disabled-form">
          <!-- Personal Information -->
          <div class="section-header">
            <i class="fas fa-user"></i>
            <span>Shaxsiy ma'lumotlar</span>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Familiya</label>
              <input type="text" :value="applicationData.last_name" disabled />
            </div>
            <div class="form-field">
              <label>Ism</label>
              <input type="text" :value="applicationData.first_name" disabled />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Otasining ismi</label>
              <input type="text" :value="applicationData.father_name || 'Kiritilmagan'" disabled />
            </div>
            <div class="form-field">
              <label>Tug'ilgan sana</label>
              <input type="date" :value="applicationData.birth_date" disabled />
            </div>
          </div>

          <!-- Passport Information -->
          <div class="section-header">
            <i class="fas fa-id-card"></i>
            <span>Pasport ma'lumotlari</span>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Pasport seriyasi</label>
              <input type="text" :value="applicationData.passportSeries" disabled />
            </div>
            <div class="form-field">
              <label>Pasport raqami</label>
              <input type="text" :value="applicationData.passportNumber" disabled />
            </div>
            <div class="form-field">
              <label>JSHIR</label>
              <input type="text" :value="applicationData.passportJsshir" disabled />
            </div>
          </div>

          <!-- Contact Information -->
          <div class="section-header">
            <i class="fas fa-phone"></i>
            <span>Aloqa ma'lumotlari</span>
          </div>

          <div class="form-row">
            <div class="form-field full-width">
              <label>Telefon raqami</label>
              <input type="tel" :value="applicationData.phone" disabled />
            </div>
          </div>

          <div class="form-field full-width">
            <label>Yashash manzili</label>
            <textarea :value="applicationData.address" disabled rows="3"></textarea>
          </div>

          <!-- Documents -->
          <div class="section-header">
            <i class="fas fa-paperclip"></i>
            <span>Yuklangan hujjatlar</span>
          </div>

          <div class="documents-section">
            <div v-if="applicationData.passport_images && applicationData.passport_images.length" class="document-grid">
              <div v-for="(imageUrl, index) in applicationData.passport_images" :key="index" class="document-item"
                @click="viewImage(imageUrl)">
                <i class="fas fa-file-image"></i>
                <span>Pasport rasmi {{ index + 1 }}</span>
                <button type="button" class="view-btn">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
            <div v-else class="no-documents">
              <i class="fas fa-folder-open"></i>
              <span>Hujjatlar topilmadi</span>
            </div>
          </div>

          <!-- Additional Information -->
          <div v-if="applicationData.additionalInfo" class="form-field full-width">
            <label>Qo'shimcha ma'lumotlar</label>
            <textarea :value="applicationData.additionalInfo" disabled rows="4"></textarea>
          </div>

          <!-- Application Dates -->
          <div class="dates-section">
            <div class="date-item" v-if="applicationData.created_at">
              <i class="fas fa-calendar-plus"></i>
              <div>
                <span class="date-label">Ariza berilgan vaqt:</span>
                <span class="date-value">{{ formatDate(applicationData.created_at) }}</span>
              </div>
            </div>
            <div class="date-item"
              v-if="applicationData.updated_at && applicationData.updated_at !== applicationData.created_at">
              <i class="fas fa-calendar-edit"></i>
              <div>
                <span class="date-label">Oxirgi o'zgarish:</span>
                <span class="date-value">{{ formatDate(applicationData.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Status Actions -->
          <div class="status-actions">
            <div v-if="applicationData.status === 'created'" class="action-card pending">
              <i class="fas fa-clock"></i>
              <div>
                <h4>Arizangiz ko'rib chiqilmoqda</h4>
                <p>Javob kutib turing. Tez orada siz bilan bog'lanamiz.</p>
                <!-- <button @click="editApplication" class="edit-btn">
                  <i class="fas fa-edit"></i>
                  Arizani tahrirlash
                </button> -->
              </div>
            </div>

            <div v-else-if="applicationData.status == 'successfull'" class="action-card successfull">
              <i class="fas fa-check-circle"></i>
              <div>
                <h2>Tabriklaymiz! Arizangiz qabul qilindi</h2>
                <!-- <p>Yotoqxona ma'lumotlari va kerakli hujjatlarni quyidagi tugmalar orqali yuklab oling.</p> -->
                <!-- <div class="download-buttons">
                  <button @click="downloadFile('contract')" class="download-btn">
                    <i class="fas fa-file-pdf"></i>
                    Shartnoma
                  </button>
                  <button @click="downloadFile('qr')" class="download-btn">
                    <i class="fas fa-qrcode"></i>
                    QR kod
                  </button>
                </div> -->@sharq_yotoqxona
              </div>
            </div>

            <div v-else-if="applicationData.status === 'rejected'" class="action-card rejected">
              <i class="fas fa-times-circle"></i>
              <div>
                <h4>Arizangiz rad etildi</h4>
                <p v-if="applicationData.rejection_reason" class="rejection-reason">
                  <strong>Sabab:</strong> {{ applicationData.rejection_reason }}
                </p>
                <p>Qo'shimcha ma'lumot uchun qo'llab-quvvatlash xizmatiga murojaat qiling.</p>
                <a href="https://t.me/sharq_qabul" target="_blank" class="contact-support">
                  <i class="fab fa-telegram"></i>
                  Qo'llab-quvvatlash
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay" @click="closeErrorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header error">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Xatolik
          </h3>
          <button @click="closeErrorModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeErrorModal" class="btn-primary">Tushunarli</button>
        </div>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <img :src="currentImageUrl" alt="Pasport rasmi" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
// import ErrorModal from './ErrorModal.vue'

export default {
  name: 'ApplicationLogin',
  setup() {
    // Form data
    const searchForm = reactive({
      passportJsshir: '',
      phone: ''
    })

    // State
    const errors = ref({})
    const loading = ref(false)
    const applicationFound = ref(false)
    const applicationData = ref({})
    const showErrorModal = ref(false)
    const errorMessage = ref('')
    const showImageModal = ref(false)
    const currentImageUrl = ref('')

    // Computed
    const isFormValid = computed(() => {
      return searchForm.passportJsshir.length === 14 &&
        searchForm.phone.match(/^\+998\d{9}$/)
    })

    // Input formatters
    const formatJsshir = (event) => {
      let value = event.target.value.replace(/[^0-9]/g, '')
      searchForm.passportJsshir = value.slice(0, 14)

      // Clear JSHIR error when user types
      if (errors.value.passportJsshir) {
        delete errors.value.passportJsshir
      }
    }

    const formatPhoneNumber = (event) => {
      let value = event.target.value.replace(/[^0-9+]/g, '')

      if (!value.startsWith('+998')) {
        if (value.startsWith('998')) {
          value = '+' + value
        } else if (value.startsWith('9')) {
          value = '+998' + value
        } else if (!value.startsWith('+')) {
          value = '+998' + value
        }
      }

      searchForm.phone = value.slice(0, 13)

      // Clear phone error when user types
      if (errors.value.phone) {
        delete errors.value.phone
      }
    }

    // Validation
    const validateForm = () => {
      errors.value = {}

      if (!searchForm.passportJsshir) {
        errors.value.passportJsshir = 'JSHIR majburiy maydon'
      } else if (!/^\d{14}$/.test(searchForm.passportJsshir)) {
        errors.value.passportJsshir = 'JSHIR 14 ta raqamdan iborat bo\'lishi kerak'
      }

      if (!searchForm.phone) {
        errors.value.phone = 'Telefon raqami majburiy maydon'
      } else if (!/^\+998\d{9}$/.test(searchForm.phone)) {
        errors.value.phone = 'Telefon raqami noto\'g\'ri formatda'
      }

      return Object.keys(errors.value).length === 0
    }

    // API methods
    const searchApplication = async () => {
      if (!validateForm()) {
        return
      }

      loading.value = true

      try {
        console.log('DATA', {
          passportJsshir: searchForm.passportJsshir,
          phone: searchForm.phone
        })
        // const response = await axios.get('http://161.97.159.45/api/app', {
        const response = await axios.post('https://api.sharq-dev.uz/api/app', {
          passportJsshir: searchForm.passportJsshir,
          phone: searchForm.phone
        })

        // applicationData.value = response.data
        const app = response.data

        applicationData.value = {
          ...app,
          passportSeries: app.passport?.series || '',
          passportNumber: app.passport?.number || '',
          passportJsshir: app.passport?.jsshir || '',
          passport_images: app.passport?.images?.map(img => `https://api.sharq-dev.uz/uploads/passport/${img}`) || []
        }
        applicationFound.value = true

        // Scroll to application section
        setTimeout(() => {
          document.querySelector('.application-section')?.scrollIntoView({
            behavior: 'smooth'
          })
        }, 100)

      } catch (error) {
        console.error('Ariza qidirishda xatolik:', error)
        // showErrorModal.value = true
        const message = error?.response?.data?.message || 'Serverda xatolik yuz berdi!'
        showError(message)

        // showError('Ariza qidirishda xatolik yuz berdi. Iltimos, ma\'lumotlaringizni tekshirib qayta urinib ko\'ring.')
        // if (error.response?.status === 404) {
        //   showError('Ushbu ma\'lumotlar bilan ariza topilmadi. Iltimos, ma\'lumotlarni tekshirib qayta urinib ko\'ring.')
        // } else if (error.response?.status === 400) {
        //   showError('Noto\'g\'ri ma\'lumotlar kiritildi. Iltimos, JSHIR va telefon raqamingizni to\'g\'ri kiriting.')
        // } else {
        //   showError('Serverda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.')
        // }
      } finally {
        loading.value = false
      }
    }

    const downloadFile = async (type) => {
      try {
        const response = await axios.get(`http://161.97.159.45/api/application/${applicationData.value.id}/download/${type}`, {
          responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', type === 'contract' ? 'shartnoma.pdf' : 'qr-kod.png')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

      } catch (error) {
        console.error('Faylni yuklashda xatolik:', error)
        showError('Faylni yuklashda xatolik yuz berdi')
      }
    }

    const editApplication = () => {
      // Redirect to edit page
      window.location.href = `/application-form?id=${applicationData.value.id}`
    }

    // UI methods
    const viewImage = (imageUrl) => {
      currentImageUrl.value = imageUrl
      showImageModal.value = true
    }

    const showError = (message) => {
      errorMessage.value = message
      showErrorModal.value = true
    }

    const closeErrorModal = () => {
      showErrorModal.value = false
      errorMessage.value = ''
    }

    const closeImageModal = () => {
      showImageModal.value = false
      currentImageUrl.value = ''
    }

    // Utility methods
    const getStatusIcon = (status) => {
      const icons = {
        pending: 'fas fa-clock',
        created: 'fas fa-hourglass-half',
        successfull: 'fas fa-check-circle',
        rejected: 'fas fa-times-circle'
      }
      return icons[status] || 'fas fa-question-circle'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: 'Kutilmoqda',
        created: 'Ko\'rib chiqilmoqda',
        successfull: 'Qabul qilindi',
        rejected: 'Rad etildi'
      }
      return texts[status] || 'Noma\'lum holat'
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return date.toLocaleDateString('uz-UZ', options)
    }

    const resetSearch = () => {
      searchForm.passportJsshir = ''
      searchForm.phone = ''
      errors.value = {}
      applicationFound.value = false
      applicationData.value = {}
    }

    return {
      // Data
      searchForm,
      errors,
      loading,
      applicationFound,
      applicationData,
      showErrorModal,
      errorMessage,
      showImageModal,
      currentImageUrl,

      // Computed
      isFormValid,

      // Methods
      formatJsshir,
      formatPhoneNumber,
      searchApplication,
      downloadFile,
      editApplication,
      viewImage,
      closeErrorModal,
      closeImageModal,
      getStatusIcon,
      getStatusText,
      formatDate,
      resetSearch
    }
  }
}
</script>

<style scoped>
.application-login {
  /* min-height: 100vh; */
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  max-width: 800px;
  width: 100%;
}

/* Login Card */
.login-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  margin-bottom: 2rem;
  text-align: center;
}

/* .logo-section {
  margin-bottom: 1.4rem;
} */

.logo {
  height: 60px;
  object-fit: contain;
  margin-bottom: 30px;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.login-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 3rem;
  line-height: 1.6;
}

/* Form Styles */
.login-form {
  max-width: 500px;
  margin: 0 auto;
  text-align: left;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-help {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.search-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.6rem;
}
.replace-url{
  cursor: pointer;
  color: #006ba6;
  width: 100%;
  text-align: center;
  padding: 0 12px;
  font-weight: bold;
  /* text-decoration: underline; */
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Additional Info */
.additional-info {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.contact-section {
  text-align: center;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #0088cc, #006ba6);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.contact-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 136, 204, 0.3);
}

/* Application Section */
.application-section {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.5s ease-out;
}

.application-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.application-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Status Badge */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-created {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.status-successfull {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.status-rejected {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.status-pending {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

/* Disabled Form */
.disabled-form {
  pointer-events: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #374151;
  margin: 2rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-field input,
.form-field textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #f9fafb;
  color: #6b7280;
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

/* Documents Section */
.documents-section {
  margin: 1.5rem 0;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-item:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.document-item i {
  font-size: 1.5rem;
  color: #667eea;
}

.document-item span {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.view-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.no-documents {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
}

/* Dates Section */
.dates-section {
  margin: 2rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .login-title{
    font-size: 2rem;
  }
 
}
@media (max-width: 500px) {
  .login-title{
    font-size: 1.5rem;
  }
  .login-card{
    padding: 1.7rem;
  }
  .application-login{
    padding: 1rem 0.5rem;
  }
  .login-subtitle{
    font-size: 1rem;
    margin-bottom: 2rem;
  }
 
}
</style>