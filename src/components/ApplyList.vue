<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <div class="admin-app application-login">
    <!-- Login Page -->
    <div v-if="!isAuthenticated" class="login-container">
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
            Yotoqxona arizalarini boshqarish
          </p>
        </div>

        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Foydalanuvchi nomi</label>
            <input type="text" id="username" v-model="loginForm.username" required :disabled="loginLoading">
          </div>

          <div class="form-group">
            <label for="password">Parol</label>
            <input type="password" id="password" v-model="loginForm.password" required :disabled="loginLoading">
          </div>

          <button type="submit" class="login-btn" :disabled="loginLoading">
            <i v-if="loginLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
            {{ loginLoading ? 'Kirmmoqda...' : 'Kirish' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Admin Panel -->
    <div v-if="isAuthenticated" class="admin-panel">
      <header class="admin-header">
        <div class="header-container">
          <img alt="Sharq logo" src="../assets/logo_sharq blue.png" class="sharq-logo" />

          <h1><i class="fas fa-home"></i> Yotoqxona Arizalari</h1>
          <div class="user-info">
            <span>{{ currentUser }}</span>
            <button class="logout-btn" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i> Chiqish
            </button>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <!-- Loading indicator -->
        <div v-if="loading" class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Ma'lumotlar yuklanmoqda...</span>
        </div>

        <template v-else>
          <!-- Statistics -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="icon pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="number">{{ statistics.pending }}
                <p class="label">Kutilmoqda</p>
              </div>

            </div>

            <div class="stat-card">
              <div class="icon successfull">
                <i class="fas fa-check"></i>
              </div>
              <div class="number">{{ statistics.successfull }}
                <div class="label">Tasdiqlangan</div>
              </div>

            </div>

            <div class="stat-card">
              <div class="icon rejected">
                <i class="fas fa-times"></i>
              </div>
              <div class="number">{{ statistics.rejected }}<div class="label">Rad etilgan</div>
              </div>

            </div>

            <div class="stat-card">
              <div class="icon total">
                <i class="fas fa-list"></i>
              </div>
              <div class="number">{{ pageInfo.total }} <div class="label">Jami arizalar</div>
              </div>

            </div>
          </div>

          <!-- Filters -->
          <div class="filters">
            <div class="filters-row">
              <div class="filter-group">
                <label>Holat</label>
                <select v-model="filters.status" @change="applyFilters">
                  <option value="">Barchasi</option>
                  <option value="created">Kutilmoqda</option>
                  <option value="successfull">Tasdiqlangan</option>
                  <option value="rejected">Rad etilgan</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Sana</label>
                <input type="date" v-model="filters.date" @change="applyFilters">
              </div>

              <div class="filter-group">
                <label>Qidirish</label>
                <input type="text" v-model="filters.search" placeholder="Ism yoki telefon raqami"
                  @keyup.enter="applyFilters" @input="debounceSearch">
              </div>

              <div class="filter-group filter-group-wrapper">
                <button class="filter-btn" @click="applyFilters" :disabled="loading">
                  <i class="fas fa-filter"></i> Filtr
                </button>
                <button class="filter-btn secondary" @click="clearFilters">
                  <i class="fas fa-times"></i> Tozalash
                </button>
              </div>
            </div>
          </div>

          <!-- Applications Table -->
          <div class="applications-table">
            <div class="table-header">
              <h2>Arizalar ro'yxati ({{ pageInfo.total }})</h2>
              <div class="table-actions">
                <div class="bulk-actions">
                  <button class="bulk-btn approve" @click="bulkApprove"
                    :disabled="selectedApplications.length === 0 || updating">
                    <i class="fas fa-check"></i>
                    Tanlanganlarni tasdiqlash ({{ selectedApplications.length }})
                  </button>
                  <button class="bulk-btn reject" @click="bulkReject"
                    :disabled="selectedApplications.length === 0 || updating">
                    <i class="fas fa-times"></i>
                    Tanlanganlarni rad etish ({{ selectedApplications.length }})
                  </button>
                </div>
                <div class="export-actions">
                  <button class="bulk-btn export" @click="exportToCSV">
                    <i class="fas fa-download"></i> Excel
                  </button>
                  <button class="bulk-btn print" @click="printApplications">
                    <i class="fas fa-print"></i> Chop etish
                  </button>
                </div>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll">
                    </th>
                    <th @click="sortBy('id')" class="sortable">
                      ID
                      <i class="fas" :class="getSortIcon('id')"></i>
                    </th>
                    <th @click="sortBy('last_name')" class="sortable">
                      F.I.O
                      <i class="fas" :class="getSortIcon('last_name')"></i>
                    </th>
                    <th>Telefon</th>
                    <th @click="sortBy('birth_date')" class="sortable">
                      Tug'ilgan sana
                      <i class="fas" :class="getSortIcon('birth_date')"></i>
                    </th>
                    <th>Holat</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="applications.length === 0">
                    <td colspan="7" class="no-data">
                      <i class="fas fa-inbox"></i>
                      Ma'lumot topilmadi
                    </td>
                  </tr>
                  <tr v-for="app in applications" :key="app.id"
                    :class="{ updating: updating && selectedApplications.includes(app.id) }">
                    <td>
                      <input type="checkbox" :checked="selectedApplications.includes(app.id)"
                        @change="toggleApplicationSelection(app.id)">
                    </td>
                    <td class="id-cell">#{{ formatId(app.id) }}</td>
                    <td class="name-cell">{{ getFullName(app) }}</td>
                    <td>{{ app.phone }}</td>
                    <td>{{ formatDate(app.birth_date) }}</td>
                    <td>
                      <span class="status-badge" :class="app.status">
                        <i class="fas" :class="'fas' + getStatusIcon(app.status)"></i>
                        {{ getStatusText(app.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn view" @click="viewApplication(app.id)" title="Ko'rish">
                          <i class="fas fa-eye"></i>
                        </button>
                        <template v-if="app.status === 'created'">
                          <button class="action-btn approve" @click="updateApplicationStatus(app.id, 'successfull')"
                            title="Tasdiqlash" :disabled="updating">
                            <i class="fas fa-check"></i>
                          </button>
                          <button class="action-btn reject" @click="updateApplicationStatus(app.id, 'rejected')"
                            title="Rad etish" :disabled="updating">
                            <i class="fas fa-times"></i>
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="pagination" v-if="pageInfo.total > pageInfo.limit">
              <button class="page-btn" @click="goToPage(1)" :disabled="currentPage === 1 || loading">
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button class="page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || loading">
                <i class="fas fa-angle-left"></i>
              </button>

              <span class="page-info">
                {{ currentPage }} / {{ totalPages }} ({{ pageInfo.total }} ta ariza)
              </span>

              <button class="page-btn" @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages || loading">
                <i class="fas fa-angle-right"></i>
              </button>
              <button class="page-btn" @click="goToPage(totalPages)" :disabled="currentPage === totalPages || loading">
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Application Details Modal -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ariza tafsilotlari</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedApplication" class="modal-body">
          <div class="applicant-details">
            <div class="detail-section">
              <h4><i class="fas fa-user"></i> Shaxsiy ma'lumotlar</h4>
              <div class="detail-item">
                <span class="detail-label">F.I.O:</span>
                <span class="detail-value">{{ getFullName(selectedApplication) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tug'ilgan sana:</span>
                <span class="detail-value">{{ formatDate(selectedApplication.birth_date) }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-id-card"></i> Pasport ma'lumotlari</h4>
              <div class="detail-item">
                <span class="detail-label">Pasport:</span>
                <span class="detail-value">
                  {{ selectedApplication.passport?.series }} {{ selectedApplication.passport?.number }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">JShShIR:</span>
                <span class="detail-value">{{ selectedApplication.passport?.jsshir }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-phone"></i> Aloqa ma'lumotlari</h4>
              <div class="detail-item">
                <span class="detail-label">Telefon:</span>
                <span class="detail-value">{{ selectedApplication.phone }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4><i class="fas fa-map-marker-alt"></i> Manzil</h4>
              <div class="detail-item">
                <span class="detail-label">Yashash manzili:</span>
                <span class="detail-value">{{ selectedApplication.address }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedApplication.additionalInfo" class="detail-section full-width">
            <h4><i class="fas fa-info-circle"></i> Qo'shimcha ma'lumotlar</h4>
            <p class="additional-info">{{ selectedApplication.additionalInfo }}</p>
          </div>

          <div class="files-section full-width">
            <h4><i class="fas fa-paperclip"></i> Yuklangan hujjatlar</h4>
            <div class="file-preview">
              <div v-for="image in selectedApplication.passport?.images || []" :key="image" class="file-item"
                @click="openImageModal(image)">
                <!-- <img v-if="isImage(image)" :src="getImageUrl(image)" :alt="image" class="passport-image"
                  @error="handleImageError">
                <img v-else :src="getImageUrl(image)" :alt="image" class="passport-image" @error="handleImageError"> -->
                <template v-if="isImage(image)">
                  <img :src="getImageUrl(image)" :alt="image" class="passport-image" @error="handleImageError" />
                  <span>{{ image }}</span>
                  <button @click.stop="downloadFile(image)">⬇️ Yuklab olish</button>
                </template>

                <template v-else-if="isPdf(image)">
                  <div class="pdf-preview">
                    <embed :src="getImageUrl(image)" type="application/pdf" width="100%" height="150px" />
                  </div>
                  <span>{{ image }}</span>
                  <button @click.stop="downloadFile(image)" class="download-btn">
                    ⬇️ Yuklab olish
                  </button>
                </template>
                <!-- <span>{{ image }}</span> -->
              </div>
            </div>
          </div>

          <div v-if="selectedApplication.status === 'created'" class="modal-actions">
            <button class="modal-btn reject"
              @click="updateApplicationStatus(selectedApplication.id, 'rejected'); closeModal();" :disabled="updating">
              <i class="fas fa-times"></i> Rad etish
            </button>
            <button class="modal-btn approve"
              @click="updateApplicationStatus(selectedApplication.id, 'successfull'); closeModal();"
              :disabled="updating">
              <i class="fas fa-check"></i> Tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="modal image-modal" @click.self="closeImageModal">
      <div class="image-modal-content">
        <button class="close-btn" @click="closeImageModal">
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedImageUrl" alt="Passport Image" class="modal-image">
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i class="fas" :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { apiService } from '@/services/apiService'

export default {
  name: 'AdminPanel',
  setup() {
    // Configuration
    const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://api.sharq-dev.uz/api'
    const ITEMS_PER_PAGE = 10

    // State
    const token = localStorage.getItem('token')
    const isAuthenticated = ref(token ? true : false)
    const currentUser = ref('')
    const loginLoading = ref(false)
    const loginError = ref('')
    const loading = ref(false)
    const updating = ref(false)
    const showModal = ref(false)
    const showImageModal = ref(false)
    const selectedApplication = ref(null)
    const selectedApplications = ref([])
    const selectedImageUrl = ref('')
    const currentPage = ref(1)
    const searchTimeout = ref(null)

    // Data
    const applications = ref([])
    const pageInfo = reactive({
      // total: 0,
      page: {
        limit: ITEMS_PER_PAGE,
        offset: 0
      },

    })

    // Forms
    const loginForm = reactive({
      username: '',
      password: ''
    })

    const filters = reactive({
      status: '',
      date: '',
      search: ''
    })

    const sortConfig = reactive({
      field: 'id',
      direction: 'desc'
    })

    // Toast notification
    const toast = reactive({
      show: false,
      message: '',
      type: '',
      icon: ''
    })

    // API Service
    const api = apiService(BASE_URL)

    // Computed properties
    const statistics = computed(() => ({
      pending: applications.value.filter(app => app.status === 'created').length,
      successfull: applications.value.filter(app => app.status === 'successfull').length,
      rejected: applications.value.filter(app => app.status === 'rejected').length
    }))

    const totalPages = computed(() => Math.ceil(pageInfo.total / pageInfo.limit))

    const isAllSelected = computed(() => {
      return applications.value.length > 0 &&
        applications.value.every(app => selectedApplications.value.includes(app.id))
    })

    // Utility methods
    const getFullName = (app) => {
      return `${app.last_name || ''} ${app.first_name || ''} ${app.father_name || ''}`.trim()
    }

    const formatId = (id) => {
      return id ? id.substring(0, 8).toUpperCase() : ''
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('uz-UZ')
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'created': return 'Kutilmoqda'
        case 'successfull': return 'Tasdiqlangan'
        case 'rejected': return 'Rad etilgan'
        default: return status
      }
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'created': return 'fa-clock'
        case 'successfull': return 'fa-check'
        case 'rejected': return 'fa-times'
        default: return 'fa-question'
      }
    }

    const getImageUrl = (imageName) => {
      return `https://api.sharq-dev.uz/uploads/passport/${imageName}`
    }

    const isImage = (fileName) => {
      return /\.(jpe?g|png|gif|webp|svg)$/i.test(fileName);
    };

    const isPdf = (fileName) => {
      return /\.pdf$/i.test(fileName);
    };

    const handleImageError = (e) => {
      e.target.src = "/fallback.png"; // fallback rasm
    };

    const downloadFile = (fileName) => {
      const url = getImageUrl(fileName);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // shu nom bilan saqlanadi
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Toast methods
    const showToast = (message, type = 'success', icon = 'fa-check') => {
      toast.message = message
      toast.type = type
      toast.icon = icon
      toast.show = true

      setTimeout(() => {
        toast.show = false
      }, 4000)
    }

    // API methods
    const fetchApplications = async () => {
      try {
        loading.value = true
        // const params = {
        //   page: {
        //     limit: pageInfo.limit,
        //     offset: (currentPage.value - 1) * pageInfo.limit
        //   }
        // }
        const params = {
        }
        const page = {}

        if (filters.status) params.status = filters.status
        if (filters.date) params.date = filters.date
        if (filters.search) params.search = filters.search
        if (pageInfo.limit) {
          page.limit = pageInfo.limit
          page.offset = (currentPage.value - 1) * pageInfo.limit
        }

        const response = await api.getApplications(params, page)
        applications.value = response.data || []
        Object.assign(pageInfo, response.pageInfo || {})
      } catch (error) {
        console.error('Error fetching applications:', error)
        showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error', 'fa-exclamation-triangle')
        applications.value = []
        pageInfo.total = 0
      } finally {
        loading.value = false
      }
    }

    const updateApplicationStatus = async (id, status) => {
      try {
        updating.value = true
        await api.updateApplicationtatus(id, { status })

        // Update local data
        const appIndex = applications.value.findIndex(app => app.id === id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = status
        }

        const statusText = getStatusText(status)
        showToast(`Ariza ${statusText.toLowerCase()} holga o'tkazildi!`, 'success', 'fa-check')
      } catch (error) {
        console.error('Error updating application status:', error)
        showToast('Arizani yangilashda xatolik yuz berdi', 'error', 'fa-exclamation-triangle')
      } finally {
        updating.value = false
      }
    }

    const bulkUpdateStatus = async (ids, status) => {
      try {
        updating.value = true
        const promises = ids.map(id => api.updateApplicationStatus(id, { status }))
        await Promise.all(promises)

        // Refresh data
        await fetchApplications()
        selectedApplications.value = []

        const statusText = getStatusText(status)
        showToast(`${ids.length} ta ariza ${statusText.toLowerCase()} holga o'tkazildi!`, 'success', 'fa-check')
      } catch (error) {
        console.error('Error bulk updating applications:', error)
        showToast('Arizalarni yangilashda xatolik yuz berdi', 'error', 'fa-exclamation-triangle')
      } finally {
        updating.value = false
      }
    }

    // Authentication methods
    const handleLogin = async () => {
      loginLoading.value = true
      loginError.value = ''

      try {
        // Simulate API call for demo - replace with real API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
          const tokenData = {
            username: loginForm.username,
            timestamp: new Date().getTime()
          }
          localStorage.setItem('token', JSON.stringify(tokenData))
          isAuthenticated.value = true
          currentUser.value = loginForm.username
          showToast('Muvaffaqiyatli kirdingiz!', 'success', 'fa-check')
          await fetchApplications()
        } else {
          loginError.value = 'Noto\'g\'ri foydalanuvchi nomi yoki parol'
        }
      } catch (error) {
        loginError.value = 'Login jarayonida xatolik yuz berdi'
        console.error('Login error:', error)
      } finally {
        loginLoading.value = false
      }
    }

    const handleLogout = () => {
      isAuthenticated.value = false
      currentUser.value = ''
      loginForm.username = ''
      loginForm.password = ''
      loginError.value = ''
      selectedApplications.value = []
      applications.value = []
      localStorage.removeItem('token')
      closeModal()
      showToast('Tizimdan chiqtingiz', 'info', 'fa-info-circle')
    }

    // Modal methods
    const viewApplication = async (id) => {
      const app = applications.value.find(app => app.id === id)
      if (app) {
        selectedApplication.value = app
        showModal.value = true
      }
    }

    const closeModal = () => {
      showModal.value = false
      selectedApplication.value = null
    }

    const openImageModal = (imageName) => {
      selectedImageUrl.value = getImageUrl(imageName)
      showImageModal.value = true
    }

    const closeImageModal = () => {
      showImageModal.value = false
      selectedImageUrl.value = ''
    }

    // Selection methods
    const toggleApplicationSelection = (id) => {
      const index = selectedApplications.value.indexOf(id)
      if (index > -1) {
        selectedApplications.value.splice(index, 1)
      } else {
        selectedApplications.value.push(id)
      }
    }

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedApplications.value = []
      } else {
        selectedApplications.value = [...applications.value.map(app => app.id)]
      }
    }

    // Bulk actions
    const bulkApprove = async () => {
      if (selectedApplications.value.length === 0) {
        showToast('Hech qanday ariza tanlanmagan!', 'warning', 'fa-exclamation-triangle')
        return
      }

      if (confirm(`${selectedApplications.value.length} ta arizani tasdiqlashni istaysizmi?`)) {
        await bulkUpdateStatus(selectedApplications.value, 'successfull')
      }
    }

    const bulkReject = async () => {
      if (selectedApplications.value.length === 0) {
        showToast('Hech qanday ariza tanlanmagan!', 'warning', 'fa-exclamation-triangle')
        return
      }

      if (confirm(`${selectedApplications.value.length} ta arizani rad etishni istaysizmi?`)) {
        await bulkUpdateStatus(selectedApplications.value, 'rejected')
      }
    }

    // Sorting and filtering
    const sortBy = (field) => {
      if (sortConfig.field === field) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc'
      } else {
        sortConfig.field = field
        sortConfig.direction = 'asc'
      }
      fetchApplications()
    }

    const getSortIcon = (field) => {
      if (sortConfig.field !== field) return 'fa-sort'
      return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
    }

    const debounceSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      searchTimeout.value = setTimeout(() => {
        applyFilters()
      }, 500)
    }

    const applyFilters = () => {
      currentPage.value = 1
      selectedApplications.value = []
      fetchApplications()
    }

    const clearFilters = () => {
      filters.status = ''
      filters.date = ''
      filters.search = ''
      currentPage.value = 1
      selectedApplications.value = []
      fetchApplications()
    }

    // Pagination
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchApplications()
      }
    }

    // Export and print
    const exportToCSV = () => {
      const headers = ['ID', 'F.I.O', 'Telefon', 'Tug\'ilgan sana', 'Pasport', 'JShShIR', 'Manzil', 'Holat']
      const rows = applications.value.map(app => [
        formatId(app.id),
        getFullName(app),
        app.phone,
        formatDate(app.birth_date),
        `${app.passport?.series || ''} ${app.passport?.number || ''}`,
        app.passport?.jsshir || '',
        app.address || '',
        getStatusText(app.status)
      ])

      const csvContent = [headers, ...rows].map(row =>
        row.map(field => `"${field}"`).join(',')
      ).join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `yotoqxona_arizalar_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      showToast('Excel fayli yuklandi!', 'success', 'fa-download')
    }

    const printApplications = () => {
      const printContent = applications.value.map(app => `
        <tr>
          <td>#${formatId(app.id)}</td>
          <td>${getFullName(app)}</td>
          <td>${app.phone}</td>
          <td>${formatDate(app.birth_date)}</td>
          <td>${app.passport?.series || ''} ${app.passport?.number || ''}</td>
          <td class="status-${app.status}">${getStatusText(app.status)}</td>
        </tr>
      `).join('')

      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Yotoqxona Arizalari</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 30px; }
              .status-created { color: #d97706; }
              .status-successfull { color: #065f46; }
              .status-rejected { color: #dc2626; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Yotoqxona Arizalari</h1>
              <p>Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
              <p>Jami: ${applications.value.length} ta ariza</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>F.I.O</th>
                  <th>Telefon</th>
                  <th>Tug'ilgan sana</th>
                  <th>Pasport</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                ${printContent}
              </tbody>
            </table>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.print()
      showToast('Chop etish oynasi ochildi!', 'info', 'fa-print')
    }

    // Keyboard shortcuts
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && showModal.value) {
        closeModal()
      }
      if (e.key === 'Escape' && showImageModal.value) {
        closeImageModal()
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        document.querySelector('input[placeholder*="Ism yoki telefon"]')?.focus()
      }
    }

    // Initialize user from token
    const initializeUser = () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem('token') || '{}')
        if (tokenData.username) {
          currentUser.value = tokenData.username
          isAuthenticated.value = true
        }
      } catch (error) {
        console.error('Error parsing token:', error)
        localStorage.removeItem('token')
        isAuthenticated.value = false
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      initializeUser()
      document.addEventListener('keydown', handleKeydown)

      if (isAuthenticated.value) {
        await fetchApplications()
      }

      // Auto-refresh every 30 seconds
      setInterval(async () => {
        if (isAuthenticated.value && !loading.value && !updating.value) {
          await fetchApplications()
        }
      }, 30000)
    })

    // Watchers
    watch(() => currentPage.value, () => {
      if (isAuthenticated.value) {
        fetchApplications()
      }
    })

    return {
      // State
      isAuthenticated,
      currentUser,
      loginLoading,
      loginError,
      loading,
      updating,
      showModal,
      showImageModal,
      selectedApplication,
      selectedApplications,
      selectedImageUrl,
      currentPage,

      // Data
      applications,
      pageInfo,

      // Forms
      loginForm,
      filters,
      sortConfig,
      toast,

      // Computed
      statistics,
      totalPages,
      isAllSelected,

      // Methods
      handleLogin,
      handleLogout,
      showToast,
      getFullName,
      formatId,
      formatDate,
      getStatusText,
      getStatusIcon,
      getImageUrl,
      isImage,
      isPdf,
      downloadFile,
      handleImageError,
      fetchApplications,
      updateApplicationStatus,
      viewApplication,
      closeModal,
      openImageModal,
      closeImageModal,
      toggleApplicationSelection,
      toggleSelectAll,
      bulkApprove,
      bulkReject,
      sortBy,
      getSortIcon,
      debounceSearch,
      applyFilters,
      clearFilters,
      goToPage,
      exportToCSV,
      printApplications
    }
  }
}
</script>

<style scoped>
.sharq-logo {
  height: 50px;
}

.admin-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1.1rem;
}

.loading-container i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

/* Login Styles */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header i {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
  display: block;
}

.login-header h1 {
  color: #2d3748;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6b7280;
  font-size: 1rem;
}

.logo {
  height: 60px;
  object-fit: contain;
}

.login-form .form-group {
  margin-bottom: 1.5rem;
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.login-form input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-form input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}

/* Admin Panel Styles */
.admin-panel {
  min-height: 100vh;
  background: #f8fafc;
}

.admin-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h1 {
  color: #2d3748;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
  color: #374151;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background: #dc2626;
}

.admin-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  display: flex;
  gap: 55px;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card .icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
}

.icon.pending {
  background: #f59e0b;
}

.icon.successfull {
  background: #10b981;
}

.icon.rejected {
  background: #ef4444;
}

.icon.total {
  background: #667eea;
}

.stat-card .number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-card .label {
  color: #6b7280;
  font-weight: 500;
}

/* Filters */
.filters {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  height: fit-content;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-btn.secondary {
  background: #6b7280;
  margin-left: 0.5rem;
}

.filter-btn.secondary:hover {
  background: #4b5563;
}

/* Applications Table */
.applications-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.table-header {
  background: #f8fafc;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h2 {
  color: #2d3748;
  font-size: 1.25rem;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.bulk-actions,
.export-actions {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-btn.approve {
  background: #10b981;
  color: white;
}

.bulk-btn.approve:hover:not(:disabled) {
  background: #059669;
}

.bulk-btn.reject {
  background: #ef4444;
  color: white;
}

.bulk-btn.reject:hover:not(:disabled) {
  background: #dc2626;
}

.bulk-btn.export {
  background: #059669;
  color: white;
}

.bulk-btn.export:hover {
  background: #047857;
}

.bulk-btn.print {
  background: #7c3aed;
  color: white;
}

.bulk-btn.print:hover {
  background: #6d28d9;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
}

th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

th.sortable:hover {
  background: #e5e7eb;
}

th.sortable i {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 3rem !important;
  font-size: 1.1rem;
}

.no-data i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.updating {
  opacity: 0.6;
  pointer-events: none;
}

.id-cell {
  font-family: monospace;
  font-weight: 600;
  color: #667eea;
}

.name-cell {
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.created {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.successfull {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.view {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.view:hover:not(:disabled) {
  background: #d1d5db;
}

.action-btn.approve {
  background: #10b981;
  color: white;
}

.action-btn.approve:hover:not(:disabled) {
  background: #059669;
}

.action-btn.reject {
  background: #ef4444;
  color: white;
}

.action-btn.reject:hover:not(:disabled) {
  background: #dc2626;
}

/* Pagination */
.pagination {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Modal */
.modal {
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
  border-radius: 12px;
  padding: 0;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f3f4f6;
  flex-shrink: 0;
}

.modal-header h3 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.applicant-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-section {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  color: #374151;
  text-align: right;
  flex: 1;
  margin-left: 1rem;
}

.additional-info {
  color: #374151;
  line-height: 1.6;
  margin: 0.5rem 0 0 0;
}

.files-section {
  margin-top: 1.5rem;
}

.file-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 200px;
}

.file-item:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.passport-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
}

.file-item span {
  font-size: 0.8rem;
  text-align: center;
  color: #6b7280;
  word-break: break-all;
}

/* Image Modal */
.image-modal {
  z-index: 1100;
}

.image-modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #f3f4f6;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn.approve {
  background: #10b981;
  color: white;
}

.modal-btn.approve:hover:not(:disabled) {
  background: #059669;
}

.modal-btn.reject {
  background: #ef4444;
  color: white;
}

.modal-btn.reject:hover:not(:disabled) {
  background: #dc2626;
}

/* Toast */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1100;
  animation: slideIn 0.3s ease;
  font-weight: 500;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.success i {
  color: #10b981;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast.warning i {
  color: #f59e0b;
}

.toast.info {
  border-left: 4px solid #3b82f6;
}

.toast.info i {
  color: #3b82f6;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.error i {
  color: #ef4444;
}

.filter-group-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
  }

  .header-container {
    flex-direction: column;
    gap: 1rem;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    justify-content: space-between;
  }

  .bulk-actions,
  .export-actions {
    flex-wrap: wrap;
  }

  .applicant-details {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    max-width: none;
  }

  .modal-header,
  .modal-body {
    padding: 1.5rem;
  }

  .toast {
    right: 1rem;
    left: 1rem;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>