# Pages to Delete After Verification

Once the application is verified to work correctly with the new page structure, the following old files can be safely deleted.

---

## Root-Level Pages (`src/pages/`)

These pages have been moved to `auth/` or `common/` folders:

```
src/pages/Complaints.jsx
src/pages/Events.jsx
src/pages/Leaves.jsx
src/pages/LostAndFound.jsx
src/pages/MyTasks.jsx
src/pages/NotificationCenter.jsx
src/pages/Profile.jsx
src/pages/Students.jsx
src/pages/UnitsAndRooms.jsx
src/pages/VisitorRequests.jsx
```

> **Note:** `AboutPage.jsx`, `ContactPage.jsx`, `Homepage.jsx`, `LoginPage.jsx`, `SSOLogin.jsx` have already been deleted.

---

## Admin Pages (`src/pages/admin/`)

Old files without `Page` suffix (replaced by new *Page.jsx versions):

```
src/pages/admin/AdminManagement.jsx
src/pages/admin/AssociateWardens.jsx
src/pages/admin/Dashboard.jsx
src/pages/admin/FaceScanners.jsx
src/pages/admin/Hostels.jsx
src/pages/admin/HostelSupervisors.jsx
src/pages/admin/Inventory.jsx
src/pages/admin/LiveCheckInOut.jsx
src/pages/admin/MaintenanceStaff.jsx
src/pages/admin/Others.jsx
src/pages/admin/SecurityLogins.jsx
src/pages/admin/Settings.jsx
src/pages/admin/Sheet.jsx
src/pages/admin/TaskManagement.jsx
src/pages/admin/UpdatePassword.jsx
src/pages/admin/Wardens.jsx
```

---

## Guard Pages (`src/pages/guard/`)

Old files without `Page` suffix:

```
src/pages/guard/AddStudentEntry.jsx
src/pages/guard/Attendance.jsx
src/pages/guard/HostelGateAttendance.jsx
src/pages/guard/ScannerEntries.jsx
src/pages/guard/StudentEntries.jsx
```

---

## Student Pages (`src/pages/student/`)

Old files without `Page` suffix:

```
src/pages/student/Dashboard.jsx
src/pages/student/IDCard.jsx
src/pages/student/Security.jsx
src/pages/student/Undertakings.jsx
```

---

## SuperAdmin Pages (`src/pages/superadmin/`)

Old files without `Page` suffix:

```
src/pages/superadmin/AdminManagement.jsx
src/pages/superadmin/ApiKeyManagement.jsx
src/pages/superadmin/Dashboard.jsx
```

---

## Warden Pages (`src/pages/warden/`)

Old files without `Page` suffix:

```
src/pages/warden/Dashboard.jsx
src/pages/warden/Feedbacks.jsx
src/pages/warden/StudentInventory.jsx
src/pages/warden/Undertakings.jsx
```

---

## Entire Folder to Delete

The old folder with typo (replaced by `maintenance/`):

```
src/pages/maintainance/   (entire folder)
```

---

## PowerShell Commands to Delete

Run these commands from `src/pages/` directory after verification:

```powershell
# Delete root-level pages
Remove-Item -Path "Complaints.jsx", "Events.jsx", "Leaves.jsx", "LostAndFound.jsx", "MyTasks.jsx", "NotificationCenter.jsx", "Profile.jsx", "Students.jsx", "UnitsAndRooms.jsx", "VisitorRequests.jsx" -Force

# Delete old admin pages
Set-Location admin
Remove-Item -Path "AdminManagement.jsx", "AssociateWardens.jsx", "Dashboard.jsx", "FaceScanners.jsx", "Hostels.jsx", "HostelSupervisors.jsx", "Inventory.jsx", "LiveCheckInOut.jsx", "MaintenanceStaff.jsx", "Others.jsx", "SecurityLogins.jsx", "Settings.jsx", "Sheet.jsx", "TaskManagement.jsx", "UpdatePassword.jsx", "Wardens.jsx" -Force
Set-Location ..

# Delete old guard pages
Set-Location guard
Remove-Item -Path "AddStudentEntry.jsx", "Attendance.jsx", "HostelGateAttendance.jsx", "ScannerEntries.jsx", "StudentEntries.jsx" -Force
Set-Location ..

# Delete old student pages
Set-Location student
Remove-Item -Path "Dashboard.jsx", "IDCard.jsx", "Security.jsx", "Undertakings.jsx" -Force
Set-Location ..

# Delete old superadmin pages
Set-Location superadmin
Remove-Item -Path "AdminManagement.jsx", "ApiKeyManagement.jsx", "Dashboard.jsx" -Force
Set-Location ..

# Delete old warden pages
Set-Location warden
Remove-Item -Path "Dashboard.jsx", "Feedbacks.jsx", "StudentInventory.jsx", "Undertakings.jsx" -Force
Set-Location ..

# Delete maintainance folder (with typo)
Remove-Item -Path "maintainance" -Recurse -Force
```

---

## Summary

| Location | Files to Delete |
|----------|-----------------|
| Root (`src/pages/`) | 10 files |
| `admin/` | 16 files |
| `guard/` | 5 files |
| `student/` | 4 files |
| `superadmin/` | 3 files |
| `warden/` | 4 files |
| `maintainance/` | Entire folder (2 files) |
| **Total** | **44 files + 1 folder** |
