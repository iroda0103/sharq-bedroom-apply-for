<template>
  <div class="dormitory-form">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <div class="form-wrapper">
      <div class="form-container">
        <header>
          <img alt="Vue logo" src="../assets/logo_sharq blue.png" class="logo" />
        </header>
        <h2 class="title">
          <i class="fas fa-home"></i>
          Yotoqxona uchun ariza
        </h2>

        <!-- Success Message -->
        <div v-if="applicationStatus === 'submitted'" class="success-message">
          <div class="success-icon">
            <i class="fas fa-check"></i>
          </div>
          <h3>✅ Arizangiz muvaffaqiyatli yuborildi!</h3>
          <p>Tez orada siz bilan bog'lanamiz. Telegram: <a href="https://t.me/sharq_yotoqxona"
              target="_blank">@sharq_yotoqxona</a></p>
        </div>

        <!-- Status Messages -->
        <div v-if="applicationStatus === 'rejected'" class="rejection-message">
          <div class="rejection-icon">
            <i class="fas fa-times"></i>
          </div>
          <h3>❌ Arizangiz rad etildi</h3>
          <p v-if="rejectionReason">Sabab: {{ rejectionReason }}</p>
          <p>Yangi ariza topshirish uchun bizning telegram kanalimizga murojaat qiling: <a
              href="https://t.me/sharq_yotoqxona" target="_blank">@sharq_yotoqxona</a></p>
        </div>

        <!-- Approved Message with Downloads -->
        <div v-if="applicationStatus === 'approved'" class="approval-message">
          <div class="approval-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>🎉 Tabriklaymiz! Arizangiz qabul qilindi!</h3>
          <p>Yotoqxona ma'lumotlari va QR kod quyidagi fayllardan topishingiz mumkin:</p>
          <div class="download-buttons">
            <button @click="downloadFile('contract')" class="btn btn-download">
              <i class="fas fa-file-pdf"></i>
              Shartnomani yuklab olish
            </button>
            <button @click="downloadFile('qr')" class="btn btn-download">
              <i class="fas fa-qrcode"></i>
              QR kodni yuklab olish
            </button>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" v-if="shouldShowForm" class="form">
          <!-- Edit Mode Indicator -->
          <div v-if="isEditMode" class="edit-indicator">
            <i class="fas fa-edit"></i>
            <span>Arizani tahrirlash rejimi</span>
          </div>

          <!-- Shaxsiy ma'lumotlar -->
          <div class="section-title">
            <i class="fas fa-user"></i>
            <span>Shaxsiy ma'lumotlar</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label">Familiya *</label>
              <input v-model="form.last_name" type="text" class="input" :class="{ error: errors.last_name }"
                :disabled="isViewMode" placeholder="Familiyangizni kiriting" required>
              <div v-if="errors.last_name" class="error-message">{{ errors.last_name }}</div>
            </div>

            <div class="form-group">
              <label class="label">Ism *</label>
              <input v-model="form.first_name" type="text" class="input" :class="{ error: errors.first_name }"
                :disabled="isViewMode" placeholder="Ismingizni kiriting" required>
              <div v-if="errors.first_name" class="error-message">{{ errors.first_name }}</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label">Otasining ismi</label>
              <input v-model="form.father_name" type="text" class="input" :disabled="isViewMode"
                placeholder="Otangizning ismini kiriting">
            </div>

            <div class="form-group">
              <label class="label">Tug'ilgan sana *</label>
              <input v-model="form.birth_date" type="date" class="input" :class="{ error: errors.birth_date }"
                :disabled="isViewMode" required>
              <div v-if="errors.birth_date" class="error-message">{{ errors.birth_date }}</div>
            </div>
          </div>

          <!-- Pasport ma'lumotlari -->
          <div class="section-title">
            <i class="fas fa-id-card"></i>
            <span>Pasport ma'lumotlari</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label">Pasport seriyasi *</label>
              <input v-model="form.passportSeries" type="text" class="input" :class="{ error: errors.passportSeries }"
                :disabled="isViewMode" placeholder="AA" maxlength="2" @input="formatPassportSeries" required>
              <div v-if="errors.passportSeries" class="error-message">{{ errors.passportSeries }}</div>
            </div>

            <div class="form-group">
              <label class="label">Pasport raqami *</label>
              <input v-model="form.passportNumber" type="text" class="input" :class="{ error: errors.passportNumber }"
                :disabled="isViewMode" placeholder="1234567" maxlength="7" @input="formatPassportNumber" required>
              <div v-if="errors.passportNumber" class="error-message">{{ errors.passportNumber }}</div>
            </div>

            <div class="form-group">
              <label class="label">JSHIR *</label>
              <input v-model="form.passportJsshir" type="text" class="input" :class="{ error: errors.passportJsshir }"
                :disabled="isViewMode" placeholder="12345678901234" maxlength="14" @input="formatJsshir" required>
              <div v-if="errors.passportJsshir" class="error-message">{{ errors.passportJsshir }}</div>
            </div>
          </div>

          <!-- Aloqa ma'lumotlari -->
          <div class="section-title">
            <i class="fas fa-phone"></i>
            <span>Aloqa ma'lumotlari</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label">Telefon raqami *</label>
              <input v-model="form.phone" type="tel" class="input" :class="{ error: errors.phone }"
                :disabled="isViewMode" placeholder="+998 90 123 45 67" @input="formatPhoneNumber" required>
              <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
            </div>
          </div>

          <!-- Yashash manzili -->
          <div class="form-group">
            <label class="label">Hozirgi yashash manzili *</label>
            <textarea v-model="form.address" class="textarea" :class="{ error: errors.address }" :disabled="isViewMode"
              placeholder="Viloyat, tuman/shahar, ko'cha, uy raqami..." rows="3" required></textarea>
            <div v-if="errors.address" class="error-message">{{ errors.address }}</div>
          </div>

          <!-- Hujjatlar yuklash -->
          <div class="section-title">
            <i class="fas fa-paperclip"></i>
            <span>Hujjatlar yuklash</span>
          </div>

          <div class="form-group">
            <label class="label">Pasport nusxasi (oldi va orqa tomoni) *</label>
            <div v-if="!isViewMode" class="upload-area" @click="$refs.passportInput.click()">
              <input ref="passportInput" type="file" multiple accept="image/*,.pdf"
                @change="handleFileUpload($event, 'passportImage')" hidden>
              <i class="fas fa-cloud-upload-alt"></i>
              <span>Pasport nusxalarini yuklang (2 ta fayl)</span>
              <small>PNG, JPG yoki PDF formatida</small>
            </div>

            <div v-if="form.passportImage.length || passportImageUrls.length" class="file-preview">
              <!-- Uploaded Files -->
              <div v-for="(file, index) in form.passportImage" :key="`file-${index}`" class="file-item">
                <i class="fas fa-file-image"></i>
                <span>{{ file.name }}</span>
                <button v-if="!isViewMode" type="button" @click="removeFile(index, 'passportImage')" class="remove-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Existing Files from Server -->
              <div v-for="(url, index) in passportImageUrls" :key="`url-${index}`" class="file-item">
                <i class="fas fa-file-image"></i>
                <span>Yuklangan fayl {{ index + 1 }}</span>
                <button type="button" @click="viewImage(url)" class="view-btn">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <div v-if="errors.passportImage" class="error-message">{{ errors.passportImage }}</div>
          </div>

          <!-- Qo'shimcha ma'lumotlar -->
          <div class="form-group">
            <label class="label">Qo'shimcha ma'lumotlar</label>
            <textarea v-model="form.additionalInfo" class="textarea" :disabled="isViewMode"
              placeholder="Yotoqxonada qolish sabablaringiz, maxsus ehtiyojlaringiz haqida yozing..." rows="4"
              maxlength="500"></textarea>
            <div class="counter">{{ form.additionalInfo.length }}/500</div>
          </div>

          <!-- Rozlik -->
          <div v-if="!isViewMode" class="agreement-group">
            <label class="checkbox-container">
              <input type="checkbox" v-model="form.agreement" required>
              <span class="checkmark"></span>
              <span class="agreement-text">
                Men barcha ma'lumotlarning to'g'riligini tasdiqlaymen va yotoqxona qoidalariga rioya
                qilishga roziman *
              </span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="actions" v-if="!isViewMode">
            <button type="button" @click="saveDraft" class="btn btn-secondary" :disabled="loading">
              <i class="fas fa-save"></i>
              Qoralama saqlash
            </button>

            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || loading">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-paper-plane"></i>
              {{ isEditMode ? 'O\'zgarishlarni saqlash' : 'Arizani yuborish' }}
            </button>
          </div>

          <!-- Edit Button for Created Status -->
          <div class="actions" v-if="isViewMode && applicationData.status === 'created'">
            <button type="button" @click="enableEditMode" class="btn btn-primary">
              <i class="fas fa-edit"></i>
              Arizani tahrirlash
            </button>
          </div>
        </form>
      </div>

      <!-- Qo'llanma bo'limi -->
      <div class="info-section">
        <div class="info-card">
          <h3>
            <i class="fas fa-info-circle"></i>
            Muhim eslatmalar
          </h3>
          <ul>
            <li>
              <i class="fas fa-check"></i>
              Pasport nusxasining ikkala tomonini yuklang
            </li>
            <li>
              <i class="fas fa-check"></i>
              Telefon raqamingiz faol va ishlaydigan bo'lishi kerak
            </li>
            <li>
              <i class="fas fa-check"></i>
              Hujjatlar tiniq va aniq holatda bo'lishi shart
            </li>
            <li>
              <i class="fas fa-check"></i>
              JSHIR 14 ta raqamdan iborat bo'lishi kerak
            </li>
          </ul>
        </div>

        <div class="contact-card">
          <h3>
            <i class="fab fa-telegram"></i>
            Bog'lanish
          </h3>
          <p>Qo'shimcha savollar uchun:</p>
          <a href="https://t.me/sharq_yotoqxona" target="_blank" class="telegram-btn">
            <i class="fab fa-telegram-plane"></i>
            @sharq_yotoqxona
          </a>
        </div>

        <div class="progress-card">
          <h3>
            <i class="fas fa-tasks"></i>
            Jarayon bosqichlari
          </h3>
          <div class="steps">
            <div class="step" :class="{
              active: currentStep >= 1,
              completed: currentStep > 1 || applicationStatus === 'submitted'
            }">
              <div class="step-number">1</div>
              <span>Ariza to'ldirish</span>
            </div>
            <div class="step" :class="{
              active: currentStep >= 2 || applicationData.status === 'created',
              completed: applicationStatus === 'approved' || applicationStatus === 'rejected'
            }">
              <div class="step-number">2</div>
              <span>Hujjat saralash</span>
            </div>
            <div class="step" :class="{
              active: applicationStatus === 'approved' || applicationStatus === 'rejected',
              completed: applicationStatus === 'approved' || applicationStatus === 'rejected'
            }">
              <div class="step-number">3</div>
              <span>Natija e'lon qilish</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay" @click="closeErrorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Xatolik</h3>
          <button @click="closeErrorModal" class="modal-clos
          e">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeErrorModal" class="btn btn-primary">OK</button>
        </div>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <img :src="currentImageUrl" alt="Pasport rasmi">
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'DormitoryApplication',
  setup() {
    // Form data
    const form = reactive({
      last_name: '',
      first_name: '',
      father_name: '',
      birth_date: '',
      passportSeries: '',
      passportNumber: '',
      passportJsshir: '',
      phone: '',
      address: '',
      passportImage: [],
      additionalInfo: '',
      agreement: false
    })

    // State management
    const errors = ref({})
    const loading = ref(false)
    const currentStep = ref(1)
    const errorMessage = ref('')
    const showErrorModal = ref(false)
    const showImageModal = ref(false)
    const currentImageUrl = ref('')

    // Application status states
    const applicationStatus = ref('new') // new, submitted, created, approved, rejected
    const applicationData = ref({})
    const passportImageUrls = ref([])
    const isEditMode = ref(false)
    const rejectionReason = ref('')

    // URL params
    const urlParams = new URLSearchParams(window.location.search)
    const applicationId = urlParams.get('id')

    // Computed properties
    const isViewMode = computed(() => {
      return applicationStatus.value === 'created' && !isEditMode.value
    })

    const shouldShowForm = computed(() => {
      return applicationStatus.value === 'new' ||
        applicationStatus.value === 'created' ||
        isEditMode.value
    })

    const isFormValid = computed(() => {
      return form.last_name.trim() &&
        form.first_name.trim() &&
        form.birth_date &&
        form.passportSeries.trim() &&
        form.passportNumber.trim() &&
        form.passportJsshir.trim() &&
        form.phone.trim() &&
        form.address.trim() &&
        (form.passportImage.length >= 2 || passportImageUrls.value.length >= 2) &&
        form.agreement
    })

    // Input formatters
    const formatPassportSeries = (event) => {
      let value = event.target.value.replace(/[^A-Za-z]/g, '').toUpperCase()
      form.passportSeries = value.slice(0, 2)
    }

    const formatPassportNumber = (event) => {
      let value = event.target.value.replace(/[^0-9]/g, '')
      form.passportNumber = value.slice(0, 7)
    }

    const formatJsshir = (event) => {
      let value = event.target.value.replace(/[^0-9]/g, '')
      form.passportJsshir = value.slice(0, 14)
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
      form.phone = value.slice(0, 13)
    }

    // Validation
    const validateForm = () => {
      errors.value = {}

      if (!form.last_name.trim()) {
        errors.value.last_name = 'Familiya majburiy maydon'
      }

      if (!form.first_name.trim()) {
        errors.value.first_name = 'Ism majburiy maydon'
      }

      if (!form.birth_date) {
        errors.value.birth_date = 'Tug\'ilgan sana majburiy maydon'
      } else {
        const birthYear = new Date(form.birth_date).getFullYear()
        const currentYear = new Date().getFullYear()
        if (currentYear - birthYear < 16 || currentYear - birthYear > 50) {
          errors.value.birth_date = 'Yosh 16-50 oralig\'ida bo\'lishi kerak'
        }
      }

      if (!form.passportSeries.trim()) {
        errors.value.passportSeries = 'Pasport seriyasi majburiy maydon'
      } else if (!/^[A-Z]{2}$/.test(form.passportSeries)) {
        errors.value.passportSeries = 'Pasport seriyasi 2 ta katta harf bo\'lishi kerak'
      }

      if (!form.passportNumber.trim()) {
        errors.value.passportNumber = 'Pasport raqami majburiy maydon'
      } else if (!/^\d{7}$/.test(form.passportNumber)) {
        errors.value.passportNumber = 'Pasport raqami 7 ta raqam bo\'lishi kerak'
      }

      if (!form.passportJsshir.trim()) {
        errors.value.passportJsshir = 'JSHIR majburiy maydon'
      } else if (!/^\d{14}$/.test(form.passportJsshir)) {
        errors.value.passportJsshir = 'JSHIR 14 ta raqam bo\'lishi kerak'
      }

      if (!form.phone.trim()) {
        errors.value.phone = 'Telefon raqami majburiy maydon'
      } else if (!/^\+998\d{9}$/.test(form.phone)) {
        errors.value.phone = 'Telefon raqami noto\'g\'ri formatda'
      }

      if (!form.address.trim()) {
        errors.value.address = 'Yashash manzili majburiy maydon'
      }

      const totalImages = form.passportImage.length + passportImageUrls.value.length
      if (totalImages < 2) {
        errors.value.passportImage = 'Pasport nusxasining ikkala tomonini yuklang (2 ta fayl)'
      }

      return Object.keys(errors.value).length === 0
    }

    // File handling
    const handleFileUpload = (event, fieldName) => {
      const files = Array.from(event.target.files)
      const currentTotal = form[fieldName].length + passportImageUrls.value.length

      if (currentTotal + files.length > 2) {
        showError('Maksimal 2 ta fayl yuklash mumkin')
        return
      }

      // Validate file types and sizes
      const validFiles = []
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showError(`${file.name} fayli juda katta (maksimal 5MB)`)
          continue
        }

        if (!file.type.match(/^image\/(jpeg|jpg|png)$/) && file.type !== 'application/pdf') {
          showError(`${file.name} fayli noto'g'ri formatda`)
          continue
        }

        validFiles.push(file)
      }

      form[fieldName] = [...form[fieldName], ...validFiles]
    }

    const removeFile = (index, fieldName) => {
      form[fieldName].splice(index, 1)
    }

    const viewImage = (url) => {
      currentImageUrl.value = url
      showImageModal.value = true
    }

    // API methods
    const loadApplicationData = async (id) => {
      try {
        loading.value = true
        const response = await axios.get(`https://api.sharq-dev.uz/api/application/${id}`)
        const data = response.data

        applicationData.value = data
        applicationStatus.value = data.status

        if (data.rejection_reason) {
          rejectionReason.value = data.rejection_reason
        }

        // Fill form with existing data
        Object.keys(form).forEach(key => {
          if (key !== 'passportImage' && key !== 'agreement' && data[key]) {
            form[key] = data[key]
          }
        })

        // Load existing passport images
        if (data.passport_images && data.passport_images.length > 0) {
          passportImageUrls.value = data.passport_images
        }

        // Set current step based on status
        if (data.status === 'created') {
          currentStep.value = 2
        } else if (data.status === 'approved' || data.status === 'rejected') {
          currentStep.value = 3
        }

      } catch (error) {
        console.error('Ma\'lumotlarni yuklashda xatolik:', error)
        showError('Ma\'lumotlarni yuklashda xatolik yuz berdi')
      } finally {
        loading.value = false
      }
    }

    const submitForm = async () => {
      if (!validateForm()) {
        return
      }

      loading.value = true

      try {
        const formData = new FormData()

        // Add form fields
        Object.keys(form).forEach(key => {
          if (key !== 'passportImage' && key !== 'agreement') {
            formData.append(key, form[key])
          }
        })

        // Add files
        form.passportImage.forEach(file => {
          formData.append('passportImage', file)
        })

        let response
        if (isEditMode.value && applicationId) {
          // Update existing application
          response = await axios.put(`https://api.sharq-dev.uz/api/application/${applicationId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          // Create new application
          response = await axios.post('https://api.sharq-dev.uz/api/application', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }

        console.log('✅ Server javobi:', response.data)

        // Reset form and show success
        if (!isEditMode.value) {
          resetForm()
          applicationStatus.value = 'submitted'
          currentStep.value = 2
        } else {
          isEditMode.value = false
          applicationStatus.value = 'created'
          showSuccess('O\'zgarishlar muvaffaqiyatli saqlandi!')
        }

      } catch (error) {
        console.error('❌ Xatolik:', error)
        const message = error.message || 'Serverda xatolik yuz berdi!'
        showError(message)
      } finally {
        loading.value = false
      }
    }

    const downloadFile = async (type) => {
      try {
        const response = await axios.get(`https://api.sharq-dev.uz/api/application/${applicationId}/download/${type}`, {
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

    // UI methods
    const enableEditMode = () => {
      isEditMode.value = true
      form.agreement = true // Auto-check agreement for edit mode
    }

    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) {
          form[key] = []
        } else if (typeof form[key] === 'boolean') {
          form[key] = false
        } else {
          form[key] = ''
        }
      })
      errors.value = {}
      passportImageUrls.value = []
    }

    const saveDraft = () => {
      const draftData = {
        ...form,
        timestamp: new Date().toISOString()
      }
      window.dormitoryDraft = draftData
      showSuccess('Qoralama saqlandi!')
    }

    const loadDraft = () => {
      if (window.dormitoryDraft && !applicationId) {
        Object.assign(form, window.dormitoryDraft)
      }
    }

    // Utility methods
    const showError = (message) => {
      errorMessage.value = message
      showErrorModal.value = true
    }

    const showSuccess = (message) => {
      // You can implement a success toast here
      alert(message)
    }

    const closeErrorModal = () => {
      showErrorModal.value = false
      errorMessage.value = ''
    }

    const closeImageModal = () => {
      showImageModal.value = false
      currentImageUrl.value = ''
    }

    // Lifecycle
    onMounted(async () => {
      if (applicationId) {
        await loadApplicationData(applicationId)
      } else {
        loadDraft()
      }
    })

    return {
      // Data
      form,
      errors,
      loading,
      currentStep,
      errorMessage,
      showErrorModal,
      showImageModal,
      currentImageUrl,
      applicationStatus,
      applicationData,
      passportImageUrls,
      isEditMode,
      rejectionReason,

      // Computed
      isViewMode,
      shouldShowForm,
      isFormValid,

      // Methods
      formatPassportSeries,
      formatPassportNumber,
      formatJsshir,
      formatPhoneNumber,
      handleFileUpload,
      removeFile,
      viewImage,
      submitForm,
      downloadFile,
      enableEditMode,
      saveDraft,
      closeErrorModal,
      closeImageModal
    }
  }
}
</script>

<style>
.dormitory-form {
  min-height: 100vh;
  padding: 2rem 1rem;
  flex-grow: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.form-wrapper {
  display: grid;
  grid-template-columns: 4fr 2fr;
  gap: 60px;
  padding: 0 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

/* Edit Mode Indicator */
.edit-indicator {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Status Messages */
.success-message {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 2rem;
}

.rejection-message {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 2rem;
}

.approval-message {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon,
.rejection-icon,
.approval-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.success-message h3,
.rejection-message h3,
.approval-message h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.success-message a,
.rejection-message a,
.approval-message a {
  color: white;
  text-decoration: underline;
}

.download-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-download {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-download:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Form Sections */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.section-title:first-of-type {
  margin-top: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-row:has(.form-group:nth-child(3)) {
  grid-template-columns: 1fr 1fr 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  text-align: start;
}

.input,
.textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input:disabled,
.textarea:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.input.error,
.textarea.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.counter {
  align-self: flex-end;
  font-size: 0.85rem;
  color: #6b7280;
}

/* File Upload */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.upload-area i {
  font-size: 2.5rem;
  color: #9ca3af;
  display: block;
  margin-bottom: 0.5rem;
}

.upload-area span {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.upload-area small {
  color: #6b7280;
  font-size: 0.85rem;
}

.file-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.file-item i {
  color: #667eea;
  font-size: 1.25rem;
}

.file-item span {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.remove-btn,
.view-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.remove-btn {
  background: #ef4444;
  color: white;
}

.view-btn {
  background: #3b82f6;
  color: white;
}

.remove-btn:hover {
  background: #dc2626;
}

.view-btn:hover {
  background: #2563eb;
}

/* Checkbox */
.agreement-group {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  position: relative;
}

.checkbox-container input {
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  background: #fafafa;
  border: 2px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkmark:after {
  content: "\f00c";
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  color: white;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.checkbox-container input:checked+.checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-container input:checked+.checkmark:after {
  opacity: 1;
}

.agreement-text {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

/* Buttons */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

/* Info Cards */
.info-card,
.contact-card,
.progress-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.info-card h3,
.contact-card h3,
.progress-card h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.info-card li i {
  color: #10b981;
  width: 16px;
}

.telegram-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0088cc, #006ba6);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.telegram-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 136, 204, 0.3);
}

/* Steps */
.steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.step.active {
  background: rgba(102, 126, 234, 0.1);
}

.step.completed {
  background: rgba(16, 185, 129, 0.1);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.step.active .step-number {
  background: #667eea;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step span {
  color: #374151;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 2px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

/* Image Modal */
.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.image-modal-content img {
  width: 100%;
  height: auto;
  display: block;
}

.image-modal-content .modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 1001;
}

.image-modal-content .modal-close:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* Responsive */
@media (max-width: 1024px) {
  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .dormitory-form {
    padding: 1rem;
  }

  .form-container,
  .info-card,
  .contact-card,
  .progress-card {
    padding: 1.5rem;
  }

  .form-wrapper {
    padding: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .download-buttons {
    flex-direction: column;
  }

  .title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 1rem;
  }

  .upload-area {
    padding: 1.5rem;
  }

  .upload-area i {
    font-size: 2rem;
  }

  .btn {
    padding: 0.6rem 1.25rem;
    font-size: 0.9rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

/* Animation classes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-message,
.rejection-message,
.approval-message {
  animation: fadeIn 0.5s ease-out;
}

/* Loading spinner */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: spin 1s linear infinite;
}
</style>