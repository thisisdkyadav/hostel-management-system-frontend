import { useState, useEffect } from "react"
import { FaUserShield, FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import SearchBar from "../../components/common/SearchBar"
import BaseTable from "../../components/common/table/BaseTable"
import NoResults from "../../components/common/NoResults"
import Modal from "../../components/common/Modal"
import superAdminService from "../../services/superAdminService"

const AdminManagement = () => {
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await superAdminService.getAllAdmins()
      setAdmins(data || [])
      setFilteredAdmins(data || [])
    } catch (err) {
      console.error("Error fetching admins:", err)
      setError(err.message || "Failed to load admins")
      window.alert("Failed to load administrators")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  useEffect(() => {
    if (!admins.length) return

    let filtered = [...admins]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((admin) => admin.name.toLowerCase().includes(term) || admin.email.toLowerCase().includes(term) || (admin.phone && admin.phone.includes(term)))
    }

    setFilteredAdmins(filtered)
  }, [admins, searchTerm])

  const handleAddAdmin = async (adminData) => {
    try {
      setLoading(true)
      await superAdminService.createAdmin(adminData)
      window.alert("Administrator added successfully")
      fetchAdmins()
      setShowAddModal(false)
    } catch (err) {
      console.error("Error adding admin:", err)
      window.alert(err.message || "Failed to add administrator")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAdmin = async (updatedAdmin) => {
    try {
      setLoading(true)
      await superAdminService.updateAdmin(updatedAdmin.id, updatedAdmin)
      window.alert("Administrator updated successfully")
      fetchAdmins()
      setEditAdmin(null)
    } catch (err) {
      console.error("Error updating admin:", err)
      window.alert(err.message || "Failed to update administrator")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this admin?")
    if (!confirmDelete) return

    try {
      setLoading(true)
      await superAdminService.deleteAdmin(id)
      window.alert("Administrator deleted successfully")
      fetchAdmins()
    } catch (err) {
      console.error("Error deleting admin:", err)
      window.alert(err.message || "Failed to delete administrator")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: "Name",
      key: "name",
      render: (admin) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-[#1360AB] rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {admin.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      key: "email",
      render: (admin) => <div className="text-sm text-gray-900">{admin.email}</div>,
    },
    {
      header: "Phone",
      key: "phone",
      render: (admin) => <div className="text-sm text-gray-900">{admin.phone || "—"}</div>,
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (admin) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => setEditAdmin(admin)} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors" aria-label="Edit admin">
            <FaEdit />
          </button>
          <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors" aria-label="Delete admin">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Admin Management</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
          <FaPlus className="mr-2" /> Add Admin
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="text-gray-600 mb-4">System administrators have complete access to the admin portal, allowing them to manage hostels, wardens, students, and other system resources.</div>

        <div className="flex justify-end">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search admins by name or email" className="w-full sm:w-64 md:w-72" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && admins.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading admins...</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <NoResults icon={<FaUserShield className="text-gray-300 text-3xl" />} message="No administrators found" suggestion="Try changing your search criteria" />
      ) : (
        <BaseTable columns={columns} data={filteredAdmins} emptyMessage="No administrators found" isLoading={loading} />
      )}

      {showAddModal && <AdminModal onClose={() => setShowAddModal(false)} onSubmit={handleAddAdmin} title="Add Admin" />}

      {editAdmin && <AdminModal admin={editAdmin} onClose={() => setEditAdmin(null)} onSubmit={handleUpdateAdmin} title="Edit Admin" />}
    </div>
  )
}

const AdminModal = ({ admin, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!admin && !formData.password) {
      newErrors.password = "Password is required for new administrators"
    }

    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Phone number is invalid"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = { ...formData }
    if (admin && !submitData.password) {
      delete submitData.password
    }

    setIsSubmitting(true)
    try {
      await onSubmit(admin ? { ...admin, ...submitData } : submitData)
    } catch (err) {
      console.error("Form submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center text-blue-800">
            <FaUserShield className="mr-2" />
            <h4 className="font-medium">Admin Information</h4>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
              Name *
            </label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.name ? "border-red-300" : "border-gray-300"}`} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email *
            </label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? "border-red-300" : "border-gray-300"}`} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {!admin && (
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password *
              </label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? "border-red-300" : "border-gray-300"}`} />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
              Phone (Optional)
            </label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? "border-red-300" : "border-gray-300"}`} />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1360AB] hover:bg-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Processing..." : admin ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminManagement
