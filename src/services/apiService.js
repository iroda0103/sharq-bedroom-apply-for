// API Service for Dormitory Application Management using Axios
// services/apiService.js

import axios from 'axios'

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Create axios instance with default configuration
 */
function createAxiosInstance(baseUrl) {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const tokenData = JSON.parse(token)
          config.headers.Authorization = `Bearer ${tokenData.access_token || tokenData.token || token}`
        } catch (e) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params)
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status}`, response.data)
      return response
    },
    (error) => {
      console.error('API Error:', error.response?.data?.message)
      
      // if (error.response) {
      //   // Server responded with error status
      //   const { status, data } = error.response
      //   throw new ApiError(
      //     data?.message || data?.error || `Server error: ${status}`,
      //     status,
      //     data?.code || `HTTP_${status}`,
      //     data
      //   )
      // } else if (error.request) {
      //   // Network error
      //   throw new ApiError(
      //     'Tarmoq xatosi. Internet aloqangizni tekshiring.',
      //     0,
      //     'NETWORK_ERROR'
      //   )
      // } else {
      //   // Other error
      //   throw new ApiError(
      //     error.message || 'Noma\'lum xatolik yuz berdi',
      //     500,
      //     'UNKNOWN_ERROR'
      //   )
      // }
    }
  )

  return instance
}

/**
 * API Service Factory
 */
export function apiService(baseUrl) {
  if (!baseUrl) {
    throw new Error('Base URL is required for API service')
  }

  const http = createAxiosInstance(baseUrl)

  const api = {
    /**
     * Get application with pagination and filters
     */
    async getApplications(params = {}) {
      try {
        const queryParams = {
        //   limit: params.limit || 10,
        //   offset: params.offset || 0,
        filters:{},
        page:{},
        }

        // Add optional filters
        if (params.status) queryParams.filters.status = params.status
        if (params.search) queryParams.search = params.search
        if (params.date) queryParams.date = params.date
        if (params.sortField) queryParams.sortField = params.sortField
        if (params.sortDirection) queryParams.sort = params.sortDirection

        // Try multiple possible endpoints
        let response
        try {
          // First try the expected endpoint
          response = await http.get('/application', { params: queryParams })
        } catch (error) {
          if (error.status === 404) {
            // Try alternative endpoints
            try {
              response = await http.get('/api/application', { params: queryParams })
            } catch (secondError) {
              if (secondError.status === 404) {
                response = await http.get('/application', { params: queryParams })
              } else {
                throw secondError
              }
            }
          } else {
            throw error
          }
        }

        const data = response.data

        // Validate response structure
        if (!data) {
          throw new ApiError('Bo\'sh javob qaytdi', 500, 'EMPTY_RESPONSE')
        }

        // Handle different response formats
        let application = []
        let pageInfo = {
          total: 0,
          limit: queryParams.limit,
          offset: queryParams.offset
        }

        if (Array.isArray(data)) {
          // Direct array response
          application = data
          pageInfo.total = data.length
        } else if (data.data && Array.isArray(data.data)) {
          // Wrapped response with data property
          application = data.data
          pageInfo = {
            total: data.pageInfo?.total || data.total || application.length,
            limit: data.pageInfo?.limit || queryParams.limit,
            offset: data.pageInfo?.offset || queryParams.offset
          }
        } else if (data.application && Array.isArray(data.application)) {
          // Alternative structure
          application = data.application
          pageInfo.total = data.total || application.length
        } else {
          throw new ApiError('Noto\'g\'ri javob formati', 500, 'INVALID_RESPONSE_FORMAT')
        }

        return {
          data: application,
          pageInfo
        }
      } catch (error) {
        console.error('Failed to fetch application:', error)
        throw error
      }
    },

    /**
     * Get single application by ID
     */
    async getApplication(id) {
      if (!id) {
        throw new ApiError('Application ID kerak', 400, 'MISSING_ID')
      }

      try {
        let response
        try {
          response = await http.get(`/application/${id}`)
        } catch (error) {
          if (error.status === 404) {
            // Try alternative endpoints
            try {
              response = await http.get(`/api/application/${id}`)
            } catch (secondError) {
              if (secondError.status === 404) {
                response = await http.get(`/application/${id}`)
              } else {
                throw secondError
              }
            }
          } else {
            throw error
          }
        }

        return response.data
      } catch (error) {
        console.error(`Failed to fetch application ${id}:`, error)
        throw error
      }
    },

    /**
     * Update application status
     */
    async updateApplicationtatus(id, updateData) {
      if (!id) {
        throw new ApiError('Application ID kerak', 400, 'MISSING_ID')
      }

      if (!updateData.status) {
        throw new ApiError('Status kerak', 400, 'MISSING_STATUS')
      }

      const validStatuses = ['successfull', 'rejected', 'created']
      if (!validStatuses.includes(updateData.status)) {
        throw new ApiError(
          `Noto'g'ri status. Quyidagilardan birini tanlang: ${validStatuses.join(', ')}`,
          400,
          'INVALID_STATUS'
        )
      }

      try {
        let response
        try {
          response = await http.patch(`/application/${id}`, updateData)
        } catch (error) {
          if (error.status === 404) {
            // Try alternative endpoints
            try {
              response = await http.patch(`/api/application/${id}`, updateData)
            } catch (secondError) {
              if (secondError.status === 404) {
                response = await http.patch(`/application/${id}`, updateData)
              } else {
                throw secondError
              }
            }
          } else {
            throw error
          }
        }

        return response.data
      } catch (error) {
        console.error(`Failed to update application ${id}:`, error)
        throw error
      }
    },

    /**
     * Bulk update application statuses
     */
    async bulkUpdateApplicationtatus(ids, updateData) {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError('Application ID array kerak', 400, 'MISSING_IDS')
      }

      try {
        // Try bulk endpoint first
        try {
          const response = await http.put('/application/bulk-update', {
            ids,
            ...updateData
          })
          return response.data
        } catch (error) {
          if (error.status === 404 || error.status === 405) {
            // Fallback to individual updates
            const promises = ids.map(id => 
              this.updateApplicationtatus(id, updateData).catch(err => ({ error: err, id }))
            )
            const results = await Promise.all(promises)
            
            const failures = results.filter(result => result.error)
            if (failures.length > 0) {
              console.warn(`${failures.length} out of ${ids.length} updates failed`, failures)
            }

            return results
          } else {
            throw error
          }
        }
      } catch (error) {
        console.error('Failed to bulk update application:', error)
        throw error
      }
    },

    /**
     * Get application statistics
     */
    async getStatistics() {
      try {
        let response
        try {
          response = await http.get('/application/statistics')
        } catch (error) {
          if (error.status === 404) {
            // Try alternative endpoints
            try {
              response = await http.get('/api/statistics')
            } catch (secondError) {
              if (secondError.status === 404) {
                response = await http.get('/stats')
              } else {
                throw secondError
              }
            }
          } else {
            throw error
          }
        }
// successfull
        const data = response.data
        return {
          total: data.total || 0,
          pending: data.pending || data.created || 0,
          successfull: data.successfull || data.successfull || 0,
          rejected: data.rejected || 0
        }
      } catch (error) {
        console.warn('Statistics endpoint not available, using fallback')
        // Return default values if statistics endpoint fails
        return {
          total: 0,
          pending: 0,
          successfull: 0,
          rejected: 0
        }
      }
    },

    /**
     * Upload file
     */
    async uploadFile(file, type = 'passport') {
      if (!file) {
        throw new ApiError('Fayl kerak', 400, 'MISSING_FILE')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      try {
        const response = await http.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        return response.data
      } catch (error) {
        console.error('Failed to upload file:', error)
        throw error
      }
    },

    /**
     * Delete application
     */
    async deleteApplication(id) {
      if (!id) {
        throw new ApiError('Application ID kerak', 400, 'MISSING_ID')
      }

      try {
        let response
        try {
          response = await http.delete(`/application/${id}`)
        } catch (error) {
          if (error.status === 404) {
            // Try alternative endpoints
            response = await http.delete(`/application/${id}`)
          } else {
            throw error
          }
        }

        return response.data
      } catch (error) {
        console.error(`Failed to delete application ${id}:`, error)
        throw error
      }
    },

    /**
     * Export application to CSV
     */
    async exportApplication(filters = {}) {
      try {
        const params = {}
        if (filters.status) params.status = filters.status
        if (filters.search) params.search = filters.search
        if (filters.date) params.date = filters.date

        const response = await http.get('/application/export', {
          params,
          responseType: 'blob'
        })

        return response.data
      } catch (error) {
        console.error('Failed to export application:', error)
        throw error
      }
    },

    /**
     * Health check
     */
    async healthCheck() {
      try {
        const response = await http.get('/health')
        return response.data
      } catch (error) {
        console.error('Health check failed:', error)
        throw error
      }
    },

    /**
     * Test connection with different endpoints
     */
    async testConnection() {
      const endpoints = [
        '/application',
        '/api/application', 
        '/application',
        '/health',
        '/api/health'
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await http.get(endpoint, { timeout: 5000 })
          console.log(`✅ Working endpoint found: ${endpoint}`)
          return { endpoint, status: response.status, working: true }
        } catch (error) {
          console.log(`❌ Failed endpoint: ${endpoint} - ${error.status || error?.response?.data?.message}`)
        }
      }

      throw new ApiError('Hech qanday endpoint ishlamayapti', 503, 'NO_WORKING_ENDPOINT')
    }
  }

  return api
}

/**
 * Error handler utility for components
 */
export function handleApiError(error, defaultMessage = 'Xatolik yuz berdi') {
  // if (error instanceof ApiError) {
    // switch (error.code) {
    //   case 'NETWORK_ERROR':
    //     return 'Internet aloqasi yo\'q. Iltimos internetni tekshiring.'
    //   case 'INVALID_STATUS':
    //     return 'Noto\'g\'ri holat tanilgan.'
    //   case 'MISSING_ID':
    //     return 'Ariza ID topilmadi.'
    //   case 'HTTP_401':
    //     return 'Sizga ruxsat berilmagan. Qayta kiring.'
    //   case 'HTTP_403':
    //     return 'Bu amalni bajarish uchun ruxsatingiz yo\'q.'
    //   case 'HTTP_404':
    //     return 'Ma\'lumot topilmadi yoki server manzili noto\'g\'ri.'
    //   case 'HTTP_500':
    //     return 'Server xatosi. Iltimos keyinroq urinib ko\'ring.'
    //   case 'NO_WORKING_ENDPOINT':
    //     return 'Server bilan bog\'lanib bo\'lmayapti. Admin bilan bog\'laning.'
    //   default:
    //     return error.message || defaultMessage
    // }
  // }
  
  return error.response?.data?.message || defaultMessage
}

/**
 * Create authenticated API service instance
 */
export function createAuthenticatedApiService(baseUrl, tokenKey = 'token') {
  const service = apiService(baseUrl)
  
  // Add token refresh logic if needed
  service.refreshToken = async () => {
    try {
      const response = await axios.post(`${baseUrl}/auth/refresh`, {
        refreshToken: localStorage.getItem('refreshToken')
      })
      
      localStorage.setItem(tokenKey, JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem(tokenKey)
      localStorage.removeItem('refreshToken')
      throw error
    }
  }
  
  return service
}

// Default export
export default apiService