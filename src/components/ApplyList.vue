  <template>
    <div class="admin-app">
      <!-- Login Page -->
      <div v-if="!isAuthenticated" class="login-container">
        <div class="login-card">
          <div class="login-header">
            <i class="fas fa-shield-alt"></i>
            <h1>Admin Panel</h1>
            <p>Yotoqxona arizalarini boshqarish</p>
          </div>
          
          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username">Foydalanuvchi nomi</label>
              <input 
                type="text" 
                id="username" 
                v-model="loginForm.username" 
                required
                :disabled="loginLoading"
              >
            </div>
            
            <div class="form-group">
              <label for="password">Parol</label>
              <input 
                type="password" 
                id="password" 
                v-model="loginForm.password" 
                required
                :disabled="loginLoading"
              >
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
          <!-- Statistics -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="icon pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="number">{{ statistics.pending }}</div>
              <div class="label">Kutilmoqda</div>
            </div>
            
            <div class="stat-card">
              <div class="icon approved">
                <i class="fas fa-check"></i>
              </div>
              <div class="number">{{ statistics.approved }}</div>
              <div class="label">Tasdiqlangan</div>
            </div>
            
            <div class="stat-card">
              <div class="icon rejected">
                <i class="fas fa-times"></i>
              </div>
              <div class="number">{{ statistics.rejected }}</div>
              <div class="label">Rad etilgan</div>
            </div>
            
            <div class="stat-card">
              <div class="icon total">
                <i class="fas fa-list"></i>
              </div>
              <div class="number">{{ statistics.total }}</div>
              <div class="label">Jami arizalar</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="filters">
            <div class="filters-row">
              <div class="filter-group">
                <label>Holat</label>
                <select v-model="filters.status">
                  <option value="">Barchasi</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="approved">Tasdiqlangan</option>
                  <option value="rejected">Rad etilgan</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label>Sana</label>
                <input type="date" v-model="filters.date">
              </div>
              
              <div class="filter-group">
                <label>Qidirish</label>
                <input 
                  type="text" 
                  v-model="filters.search" 
                  placeholder="Ism yoki telefon raqami"
                  @keyup.enter="applyFilters"
                >
              </div>
              
              <div class="filter-group">
                <button class="filter-btn" @click="applyFilters">
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
              <h2>Arizalar ro'yxati ({{ filteredApplications.length }})</h2>
              <div class="table-actions">
                <div class="bulk-actions">
                  <button 
                    class="bulk-btn approve" 
                    @click="bulkApprove"
                    :disabled="selectedApplications.length === 0"
                  >
                    <i class="fas fa-check"></i> Tanlanganlarni tasdiqlash ({{ selectedApplications.length }})
                  </button>
                  <button 
                    class="bulk-btn reject" 
                    @click="bulkReject"
                    :disabled="selectedApplications.length === 0"
                  >
                    <i class="fas fa-times"></i> Tanlanganlarni rad etish ({{ selectedApplications.length }})
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
                      <input 
                        type="checkbox" 
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                      >
                    </th>
                    <th @click="sortBy('id')" class="sortable">
                      ID 
                      <i class="fas" :class="getSortIcon('id')"></i>
                    </th>
                    <th @click="sortBy('lastName')" class="sortable">
                      F.I.O 
                      <i class="fas" :class="getSortIcon('lastName')"></i>
                    </th>
                    <th>Telefon</th>
                    <th @click="sortBy('submissionDate')" class="sortable">
                      Sana 
                      <i class="fas" :class="getSortIcon('submissionDate')"></i>
                    </th>
                    <th>Holat</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in paginatedApplications" :key="app.id">
                    <td>
                      <input 
                        type="checkbox" 
                        :checked="selectedApplications.includes(app.id)"
                        @change="toggleApplicationSelection(app.id)"
                      >
                    </td>
                    <td>#{{ String(app.id).padStart(4, '0') }}</td>
                    <td>{{ app.lastName }} {{ app.firstName }} {{ app.middleName }}</td>
                    <td>{{ app.phone }}</td>
                    <td>{{ formatDate(app.submissionDate) }}</td>
                    <td>
                      <span class="status-badge" :class="app.status">
                        {{ getStatusText(app.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn view" @click="viewApplication(app.id)" title="Ko'rish">
                          <i class="fas fa-eye"></i>
                        </button>
                        <template v-if="app.status === 'pending'">
                          <button 
                            class="action-btn approve" 
                            @click="updateApplicationStatus(app.id, 'approved')"
                            title="Tasdiqlash"
                          >
                            <i class="fas fa-check"></i>
                          </button>
                          <button 
                            class="action-btn reject" 
                            @click="updateApplicationStatus(app.id, 'rejected')"
                            title="Rad etish"
                          >
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
            <div class="pagination" v-if="totalPages > 1">
              <button 
                class="page-btn" 
                @click="currentPage = 1" 
                :disabled="currentPage === 1"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button 
                class="page-btn" 
                @click="currentPage--" 
                :disabled="currentPage === 1"
              >
                <i class="fas fa-angle-left"></i>
              </button>
              
              <span class="page-info">
                {{ currentPage }} / {{ totalPages }} ({{ filteredApplications.length }} ta ariza)
              </span>
              
              <button 
                class="page-btn" 
                @click="currentPage++" 
                :disabled="currentPage === totalPages"
              >
                <i class="fas fa-angle-right"></i>
              </button>
              <button 
                class="page-btn" 
                @click="currentPage = totalPages" 
                :disabled="currentPage === totalPages"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
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
                  <span class="detail-value">
                    {{ selectedApplication.lastName }} {{ selectedApplication.firstName }} {{ selectedApplication.middleName }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Tug'ilgan sana:</span>
                  <span class="detail-value">{{ formatDate(selectedApplication.birthDate) }}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h4><i class="fas fa-id-card"></i> Pasport ma'lumotlari</h4>
                <div class="detail-item">
                  <span class="detail-label">Pasport:</span>
                  <span class="detail-value">{{ selectedApplication.passportSeries }} {{ selectedApplication.passportNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">JShShIR:</span>
                  <span class="detail-value">{{ selectedApplication.jshshir }}</span>
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
                  <span class="detail-value">{{ selectedApplication.currentAddress }}</span>
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
                <div 
                  v-for="file in selectedApplication.passportFiles" 
                  :key="file" 
                  class="file-item"
                >
                  <i class="fas fa-file-image"></i>
                  <span>{{ file }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedApplication.status === 'pending'" class="modal-actions">
              <button 
                class="modal-btn reject" 
                @click="updateApplicationStatus(selectedApplication.id, 'rejected'); closeModal();"
              >
                <i class="fas fa-times"></i> Rad etish
              </button>
              <button 
                class="modal-btn approve" 
                @click="updateApplicationStatus(selectedApplication.id, 'approved'); closeModal();"
              >
                <i class="fas fa-check"></i> Tasdiqlash
              </button>
            </div>
          </div>
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

  export default {
    name: 'AdminPanel',
    setup() {
      // State
      const isAuthenticated = ref(false)
      const currentUser = ref('')
      const loginLoading = ref(false)
      const loginError = ref('')
      const showModal = ref(false)
      const selectedApplication = ref(null)
      const selectedApplications = ref([])
      const currentPage = ref(1)
      const itemsPerPage = ref(10)

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

      // Sample data
      const applications = ref([
        {
          id: 1,
          firstName: "Akmal",
          lastName: "Karimov",
          middleName: "Azimovich",
          phone: "+998 90 123 45 67",
          birthDate: "2000-05-15",
          passportSeries: "AA",
          passportNumber: "1234567",
          jshshir: "12345678901234",
          currentAddress: "Toshkent viloyati, Chirchiq shahar, Mustaqillik ko'chasi, 15-uy",
          additionalInfo: "Yotoqxonada qolish uchun ariza beraman. Universitetga uzoq masofada yashayman.",
          status: "pending",
          submissionDate: "2024-01-15",
          passportFiles: ["passport_front.jpg", "passport_back.jpg"]
        },
        {
          id: 2,
          firstName: "Malika",
          lastName: "Usmanova", 
          middleName: "Baxtiyor qizi",
          phone: "+998 91 234 56 78",
          birthDate: "1999-12-22",
          passportSeries: "AB",
          passportNumber: "2345678",
          jshshir: "23456789012345",
          currentAddress: "Samarqand viloyati, Samarqand shahar, Registon ko'chasi, 25-uy",
          additionalInfo: "Talaba sifatida yotoqxonada joy talab qilaman.",
          status: "approved",
          submissionDate: "2024-01-14",
          passportFiles: ["passport_1.jpg", "passport_2.jpg"]
        },
        {
          id: 3,
          firstName: "Jasur",
          lastName: "Rahimov",
          middleName: "Olimovich",
          phone: "+998 93 345 67 89",
          birthDate: "2001-03-10",
          passportSeries: "AC",
          passportNumber: "3456789",
          jshshir: "34567890123456",
          currentAddress: "Andijon viloyati, Andijon shahar, Navoi ko'chasi, 35-uy",
          additionalInfo: "",
          status: "rejected",
          submissionDate: "2024-01-13",
          passportFiles: ["doc1.pdf"]
        },
        {
          id: 4,
          firstName: "Dilnoza",
          lastName: "Tosheva",
          middleName: "Karim qizi",
          phone: "+998 94 456 78 90",
          birthDate: "2000-08-20",
          passportSeries: "AD",
          passportNumber: "4567890",
          jshshir: "45678901234567",
          currentAddress: "Namangan viloyati, Namangan shahar, Alisher Navoi ko'chasi, 45-uy",
          additionalInfo: "Oilam boshqa viloyatda yashaymiz, yotoqxona juda muhim.",
          status: "pending",
          submissionDate: "2024-01-16",
          passportFiles: ["pass1.jpg", "pass2.jpg"]
        },
        {
          id: 5,
          firstName: "Bobur",
          lastName: "Yuldashev",
          middleName: "Sardor o'g'li",
          phone: "+998 95 567 89 01",
          birthDate: "1999-11-30",
          passportSeries: "AE",
          passportNumber: "5678901",
          jshshir: "56789012345678",
          currentAddress: "Farg'ona viloyati, Farg'ona shahar, Mustaqillik ko'chasi, 55-uy",
          additionalInfo: "Iqtidorli talabaman, yotoqxonaga juda muhtojman.",
          status: "approved",
          submissionDate: "2024-01-12",
          passportFiles: ["document1.pdf"]
        }
      ])

      // Computed properties
      const statistics = computed(() => ({
        pending: applications.value.filter(app => app.status === 'pending').length,
        approved: applications.value.filter(app => app.status === 'approved').length,
        rejected: applications.value.filter(app => app.status === 'rejected').length,
        total: applications.value.length
      }))

      const filteredApplications = computed(() => {
        let filtered = [...applications.value]

        // Status filter
        if (filters.status) {
          filtered = filtered.filter(app => app.status === filters.status)
        }

        // Date filter
        if (filters.date) {
          filtered = filtered.filter(app => app.submissionDate === filters.date)
        }

        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          filtered = filtered.filter(app => {
            const fullName = `${app.firstName} ${app.lastName} ${app.middleName}`.toLowerCase()
            const phone = app.phone.toLowerCase()
            return fullName.includes(searchTerm) || phone.includes(searchTerm)
          })
        }

        // Sorting
        filtered.sort((a, b) => {
          let aValue = a[sortConfig.field]
          let bValue = b[sortConfig.field]

          if (sortConfig.field === 'submissionDate' || sortConfig.field === 'birthDate') {
            aValue = new Date(aValue)
            bValue = new Date(bValue)
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        return filtered
      })

      const totalPages = computed(() => Math.ceil(filteredApplications.value.length / itemsPerPage.value))

      const paginatedApplications = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredApplications.value.slice(start, end)
      })

      const isAllSelected = computed(() => {
        return paginatedApplications.value.length > 0 && 
              paginatedApplications.value.every(app => selectedApplications.value.includes(app.id))
      })

      // Methods
      const handleLogin = async () => {
        loginLoading.value = true
        loginError.value = ''

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))

          if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
            isAuthenticated.value = true
            currentUser.value = loginForm.username
            showToast('Muvaffaqiyatli kirdingiz!', 'success', 'fa-check')
          } else {
            loginError.value = 'Noto\'g\'ri foydalanuvchi nomi yoki parol'
          }
        } catch (error) {
          loginError.value = 'Login jarayonida xatolik yuz berdi'
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
        closeModal()
        showToast('Tizimdan chiqtingiz', 'info', 'fa-info')
      }

      const showToast = (message, type = 'success', icon = 'fa-check') => {
        toast.message = message
        toast.type = type
        toast.icon = icon
        toast.show = true
        
        setTimeout(() => {
          toast.show = false
        }, 3000)
      }

      const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('uz-UZ')
      }

      const getStatusText = (status) => {
        switch(status) {
          case 'pending': return 'Kutilmoqda'
          case 'approved': return 'Tasdiqlangan'
          case 'rejected': return 'Rad etilgan'
          default: return status
        }
      }

      const viewApplication = (id) => {
        selectedApplication.value = applications.value.find(app => app.id === id)
        showModal.value = true
      }

      const closeModal = () => {
        showModal.value = false
        selectedApplication.value = null
      }

      const updateApplicationStatus = (id, newStatus) => {
        const appIndex = applications.value.findIndex(app => app.id === id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = newStatus
          const statusText = getStatusText(newStatus)
          showToast(`Ariza ${statusText.toLowerCase()} holga o'tkazildi!`, 'success', 'fa-check')
        }
      }

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
          selectedApplications.value = selectedApplications.value.filter(
            id => !paginatedApplications.value.find(app => app.id === id)
          )
        } else {
          paginatedApplications.value.forEach(app => {
            if (!selectedApplications.value.includes(app.id)) {
              selectedApplications.value.push(app.id)
            }
          })
        }
      }

      const bulkApprove = () => {
        if (selectedApplications.value.length === 0) {
          showToast('Hech qanday ariza tanlanmagan!', 'warning', 'fa-exclamation')
          return
        }

        if (confirm(`${selectedApplications.value.length} ta arizani tasdiqlashni istaysizmi?`)) {
          selectedApplications.value.forEach(id => {
            updateApplicationStatus(id, 'approved')
          })
          selectedApplications.value = []
          showToast('Tanlangan arizalar tasdiqlandi!', 'success', 'fa-check')
        }
      }

      const bulkReject = () => {
        if (selectedApplications.value.length === 0) {
          showToast('Hech qanday ariza tanlanmagan!', 'warning', 'fa-exclamation')
          return
        }

        if (confirm(`${selectedApplications.value.length} ta arizani rad etishni istaysizmi?`)) {
          selectedApplications.value.forEach(id => {
            updateApplicationStatus(id, 'rejected')
          })
          selectedApplications.value = []
          showToast('Tanlangan arizalar rad etildi!', 'success', 'fa-times')
        }
      }

      const sortBy = (field) => {
        if (sortConfig.field === field) {
          sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc'
        } else {
          sortConfig.field = field
          sortConfig.direction = 'asc'
        }
        currentPage.value = 1
      }

      const getSortIcon = (field) => {
        if (sortConfig.field !== field) return 'fa-sort'
        return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
      }

      const applyFilters = () => {
        currentPage.value = 1
        selectedApplications.value = []
      }

      const clearFilters = () => {
        filters.status = ''
        filters.date = ''
        filters.search = ''
        currentPage.value = 1
        selectedApplications.value = []
      }

      const exportToCSV = () => {
        const headers = ['ID', 'F.I.O', 'Telefon', 'Tug\'ilgan sana', 'Pasport', 'JShShIR', 'Manzil', 'Holat', 'Sana']
        const rows = filteredApplications.value.map(app => [
          app.id,
          `${app.lastName} ${app.firstName} ${app.middleName}`,
          app.phone,
          app.birthDate,
          `${app.passportSeries} ${app.passportNumber}`,
          app.jshshir,
          app.currentAddress,
          getStatusText(app.status),
          app.submissionDate
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
        const printContent = filteredApplications.value.map(app => `
          <tr>
            <td>#${String(app.id).padStart(4, '0')}</td>
            <td>${app.lastName} ${app.firstName}</td>
            <td>${app.phone}</td>
            <td>${formatDate(app.birthDate)}</td>
            <td>${app.passportSeries} ${app.passportNumber}</td>
            <td class="status-${app.status}">${getStatusText(app.status)}</td>
            <td>${formatDate(app.submissionDate)}</td>
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
                .status-pending { color: #d97706; }
                .status-approved { color: #065f46; }
                .status-rejected { color: #dc2626; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Yotoqxona Arizalari</h1>
                <p>Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
                <p>Jami: ${filteredApplications.value.length} ta ariza</p>
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
                    <th>Ariza sanasi</th>
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

      // Watchers
      watch(() => filteredApplications.value.length, () => {
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value
        }
      })

      // Keyboard shortcuts
      const handleKeydown = (e) => {
        if (e.key === 'Escape' && showModal.value) {
          closeModal()
        }
        if (e.ctrlKey && e.key === 'f') {
          e.preventDefault()
          document.querySelector('input[placeholder*="Ism yoki telefon"]')?.focus()
        }
      }

      // Lifecycle
      onMounted(() => {
        document.addEventListener('keydown', handleKeydown)
        
        // Auto-refresh every 30 seconds (for demo)
        setInterval(() => {
          if (isAuthenticated.value) {
            // In real app, this would fetch from API
            console.log('Auto-refresh statistics')
          }
        }, 30000)
      })

      return {
        // State
        isAuthenticated,
        currentUser,
        loginLoading,
        loginError,
        showModal,
        selectedApplication,
        selectedApplications,
        currentPage,
        itemsPerPage,
        
        // Forms
        loginForm,
        filters,
        sortConfig,
        toast,
        
        // Data
        applications,
        
        // Computed
        statistics,
        filteredApplications,
        totalPages,
        paginatedApplications,
        isAllSelected,
        
        // Methods
        handleLogin,
        handleLogout,
        showToast,
        formatDate,
        getStatusText,
        viewApplication,
        closeModal,
        updateApplicationStatus,
        toggleApplicationSelection,
        toggleSelectAll,
        bulkApprove,
        bulkReject,
        sortBy,
        getSortIcon,
        applyFilters,
        clearFilters,
        exportToCSV,
        printApplications
      }
    }
  }
  </script>

  <style scoped>
  .admin-app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    max-width: 400px;
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

  .header-container{
    max-width: 1200px;
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

  .icon.pending { background: #f59e0b; }
  .icon.approved { background: #10b981; }
  .icon.rejected { background: #ef4444; }
  .icon.total { background: #667eea; }

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

  .filter-btn:hover {
    background: #5a67d8;
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

  th, td {
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

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .status-badge.pending {
    background: #fef3c7;
    color: #d97706;
  }

  .status-badge.approved {
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

  .action-btn.view {
    background: #e5e7eb;
    color: #374151;
  }

  .action-btn.view:hover {
    background: #d1d5db;
  }

  .action-btn.approve {
    background: #10b981;
    color: white;
  }

  .action-btn.approve:hover {
    background: #059669;
  }

  .action-btn.reject {
    background: #ef4444;
    color: white;
  }

  .action-btn.reject:hover {
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
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f3f4f6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .file-item:hover {
    background: #e5e7eb;
  }

  .file-item i {
    color: #667eea;
    font-size: 1.25rem;
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

  .modal-btn.approve {
    background: #10b981;
    color: white;
  }

  .modal-btn.approve:hover {
    background: #059669;
  }

  .modal-btn.reject {
    background: #ef4444;
    color: white;
  }

  .modal-btn.reject:hover {
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

    th, td {
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