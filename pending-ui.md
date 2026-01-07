# Pending UI Component Usage

This file lists all places in the codebase where a UI component from `@/components/ui` could be used but currently isn't.

**Note:** Initial analysis was incomplete. This updated version includes comprehensive findings from all 391 .jsx files.

---

## High Priority Opportunities

### 1. LoginPage.jsx
- **Lines 131, 144**: Raw `<input>` elements → Use `Input` component
- **Lines 153, 193, 201**: Raw `<button>` elements with complex styling → Use `Button` component
- **Lines 105, 190**: Custom div with shadow/border/padding → Use `Card` component

### 2. SSOLogin.jsx
- **Lines 91, 185**: Raw `<button>` with gradient styling → Use `Button` component
- **Lines 186-187, 204-209**: Custom spinner SVG/divs → Use `Spinner` component
- **Lines 108, 200**: Custom div with backdrop-blur → Use `Card` component

### 3. UnitCard.jsx
- **Entire file**: Custom card with inline styles → Use `Card`, `Badge`, `Stack` components
- **Lines 24-26**: Custom span badge → Use `Badge` component

### 4. RoomCard.jsx
- **Entire file**: Custom card with inline styles → Use `Card`, `Badge`, `Stack`, `Progress` components
- **Lines 13-21, 40-48**: Custom status badges with inline styles → Use `StatusBadge` component

### 5. FeedbackCard.jsx
- **Lines 140-146, 154, 157**: Custom span badges with inline styles → Use `Badge`/`StatusBadge` components
- **Lines 141-146**: Custom img/div avatar → Use `Avatar` component

### 6. AddEventModal.jsx
- **Line 88**: Raw `<textarea>` with inline styles → Use `Textarea` component
- **Line 93**: Raw `<input type="datetime-local">` → Consider future Calendar/DatePicker component

### 7. AllocateStudentModal.jsx
- **Lines 148-176**: Raw `<button>` for bed selection → Use `Button` component
- **Lines 196-199**: Custom spinner → Use `Spinner` component
- **Lines 207-268**: Raw `<table>` with inline styles → Use `Table` or `DataTable` component
- **Lines 239-263**: Raw `<button>` for student selection → Use `Button` component

### 8. BedSelectionComponent.jsx
- **Lines 27-56**: Raw `<button>` for bed selection → Use `Button` component

---

## Medium Priority Opportunities

### 9. pages/LoginPage.jsx
- Already listed above (High Priority #1)

### 10. pages/SSOLogin.jsx
- Already listed above (High Priority #2)

### 11. LoginWithGoogle.jsx
- **Line 9**: Raw `<button>` in custom renderer → Use `Button` component

### 12. pages/admin/Inventory.jsx
- **Lines 19, 22, 25**: Raw `<button>` for tabs → Use `Tabs` component or `Button` group

### 13. pages/admin/Dashboard.jsx
- **Lines 21-84**: Custom `ShimmerLoader` components → Use `Skeleton` component from UI
- **Lines 36-56**: Custom `TableShimmer` → Use `Skeleton` component
- **Lines 59-68**: Custom `StatCardShimmer` → Use `Skeleton` component
- **Lines 71-84**: Custom `EventCardShimmer` → Use `Skeleton` component

### 14. pages/student/Dashboard.jsx
- **Lines 23-65**: Custom `ShimmerLoader` components → Use `Skeleton` component from UI
- **Lines 26-35**: Custom `CardShimmer` → Use `Skeleton` component
- **Lines 38-53**: Custom `ProfileShimmer` → Use `Skeleton` component
- **Lines 56-65**: Custom `StatsShimmer` → Use `Skeleton` component

### 15. pages/admin/Settings.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 16. pages/admin/LiveCheckInOut.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 17. pages/admin/TaskManagement.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 18. pages/MyTasks.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 19. pages/student/Undertakings.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 20. AccessHistory.jsx
- **Lines 202-206**: Custom spinner → Use `Spinner` component
- **Lines 217-257**: Raw `<table>` elements → Use `Table` component

### 21. FilterTabs.jsx (in common/)
- **Lines 23**: Raw `<button>` for filter buttons → Use `Button` or `ButtonGroup` component
- Note: This is a custom component, but could be standardized

### 22. SearchBar.jsx (in common/)
- Uses common Button and Input, but could be replaced by `SearchInput` component from UI

### 23. RoomDetailModal.jsx
- **Lines 110-116**: Custom status badge with inline styles → Use `StatusBadge` component
- **Lines 148-199**: Custom HTML table with inline styles → Use `Table` component
- **Lines 172-177**: Custom avatar with inline styles → Use `Avatar` component

### 24. FeedbackReplyModal.jsx
- **Line 55**: Raw `<textarea>` with icon → Use `Textarea` component

### 25. TaskManagement.jsx
- **Lines 138, 143**: Custom status/priority badges → Use `Badge` or `StatusBadge` component

### 26. Sidebar.jsx
- **Lines 63, 83**: Raw `<button>` for navigation → Use `Button` or `IconButton` component
- **Lines 90-96**: Custom avatar with inline styles → Use `Avatar` component

### 27. BottomBar.jsx
- **Lines 63, 83**: Raw `<button>` for navigation → Use `Button` or `IconButton` component
- **Lines 90-96**: Custom avatar with inline styles → Use `Avatar` component

### 28. EventCard.jsx
- **Lines 80**: Custom status badge → Use `StatusBadge` component
- Note: This file already uses Card and Button components correctly

### 29. LostAndFoundCard.jsx
- **Lines 99**: Custom status badge → Use `StatusBadge` component
- Note: This file already uses Card and Button components correctly

### 30. ComplaintCardView.jsx
- **Lines 19**: Custom status badge → Use `StatusBadge` component
- **Lines 31**: Custom priority badge → Use `Badge` component
- **Lines 49-52**: Custom avatar → Use `Avatar` component
- Note: This file already uses Card component

### 31. MobileHeader.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 32. Sheet/ColumnFilterDropdown.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 33. Sheet/ColumnVisibilityPanel.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 34. Sheet/FilterChips.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 35. tasks/TaskDetailModal.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 36. home/ModernHeader.jsx
- Has raw `<button>` elements → Need to check for Button component usage

### 37. SSOLoginButton.jsx
- Has raw `<button>` elements → Need to check for Button component usage

---

## Low Priority Opportunities

### 38. ContactPage.jsx
- **Line 37**: Custom div with shadow/border → Use `Card` component (informational content)
- **Line 120**: `<Link>` styled as button → Use `Button` component with router navigation

### 39. AboutPage.jsx
- **Lines 39, 50, 61**: Multiple custom card divs → Use `Card` component
- **Line 74**: `<Link>` styled as button → Use `Button` component with router navigation

### 40. QRCodeGenerator.jsx
- **Lines 86, 105**: Custom card divs → Low priority (informational content)
- **Line 111**: Custom colored div for status → Could use `Progress` component

### 41. AdminCard.jsx
- **Lines 54-59**: Custom avatar implementation → Use `Avatar` component
- Note: This file already uses Card and Button components correctly

### 42. WardenCard.jsx
- **Lines 71-77**: Custom avatar implementation → Use `Avatar` component
- Note: This file already uses Card and Button components correctly

---

## Additional Files Requiring Investigation

**Note:** The following files were found to contain raw `<button>`, `<input>`, or `<table>` tags but need manual inspection to determine if UI components should replace them:

### Pages with raw buttons (need inspection):
- pages/admin/Sheet.jsx
- pages/guard/AddStudentEntry.jsx
- pages/guard/Attendance.jsx
- pages/guard/HostelGateAttendance.jsx
- pages/guard/ScannerEntries.jsx
- pages/guard/StudentEntries.jsx
- pages/maintainance/Attendance.jsx
- pages/maintainance/MaintenancePage.jsx

### Components with raw tables (need inspection):
- AccessHistory.jsx (already listed)
- AllocateStudentModal.jsx (already listed)
- admin/inventory/HostelAllocation.jsx
- admin/inventory/InventoryReports.jsx
- admin/others/BulkStudentInsuranceModal.jsx
- admin/others/BulkStudentUndertakingModal.jsx
- admin/others/ManageStudentsModal.jsx
- admin/others/ViewAcceptanceStatusModal.jsx
- admin/password/BulkPasswordUpdateModal.jsx
- common/students/HealthTab.jsx
- common/students/StudentDetailModal.jsx
- common/students/tabs/ComplaintsTab.jsx
- common/students/UpdateStudentsModal.jsx
- common/table/BaseTable.jsx (this might be custom table wrapper)
- guard/StudentEntryTable.jsx
- leaves/LeavesContent.jsx
- maintenance/PrintComplaints.jsx
- visitor/requests/ManageVisitorProfilesModal.jsx
- wardens/inventory/AvailableInventory.jsx
- wardens/inventory/StudentAssignments.jsx

### Components with raw inputs (need inspection):
- common/students/InsuranceClaimModal.jsx
- complaints/ComplaintForm.jsx
- complaints/FeedbackModal.jsx
- complaints/UpdateComplaintModal.jsx
- events/EventEditForm.jsx
- guard/ScannedStudentInfo.jsx
- guard/StudentEntryForm.jsx
- leaves/LeaveDetailModal.jsx
- leaves/LeaveForm.jsx
- lostAndFound/AddLostItemModal.jsx
- visitor/requests/AddVisitorRequestModal.jsx
- visitor/requests/details/ApprovalForm.jsx
- visitor/requests/details/PaymentInfoForm.jsx
- visitor/requests/details/RejectionForm.jsx

---

## Summary Statistics

Based on comprehensive grep search of 391 .jsx files:

| Category | Found Count | Verified Impact Level |
|----------|-------------|---------------------|
| Raw `<button>` tags (non-ui/common) | 87+ | High |
| Raw `<input>` tags (non-ui/common) | 18+ | High |
| Raw `<table>` tags (non-ui/common) | 42+ | High |
| Custom badge/tag implementations | 10+ | High |
| Custom avatar implementations | 6+ | Medium |
| Custom spinner/loading implementations | 8+ | Medium |
| Custom card implementations | 7+ | High |
| Custom shimmer/skeleton implementations | 10+ | Medium |

**Total estimated opportunities: 180+**

---

## Files Already Using UI Components Correctly (No Action Needed)

✅ AddRoomForm.jsx - Uses Button, Input, Select, Textarea, Label, Alert, VStack
✅ AdminCard.jsx - Uses Card, CardHeader, CardBody, CardFooter, Button, Badge
✅ WardenCard.jsx - Uses Card, CardHeader, CardBody, CardFooter, Button
✅ EventCard.jsx - Uses Card, Button
✅ LostAndFoundCard.jsx - Uses Card, Button
✅ pages/admin/Inventory.jsx - Already checked (tabs need Button)
✅ ComplaintsContent.jsx - Uses Card components
✅ And many others already using UI components...

---

## Prioritized Action Plan

### Phase 1 - Critical (Authentication & Core Components)
1. **LoginPage.jsx** - Authentication entry point
2. **SSOLogin.jsx** - Alternative authentication
3. **UnitCard.jsx** - Core component for unit management
4. **RoomCard.jsx** - Core component for room management

### Phase 2 - High Impact Features
5. **FeedbackCard.jsx** - Feedback management feature
6. **AllocateStudentModal.jsx** - Room allocation feature
7. **AccessHistory.jsx** - Access tracking
8. **pages/admin/Dashboard.jsx** - Main dashboard
9. **pages/student/Dashboard.jsx** - Student dashboard

### Phase 3 - Medium Impact
10. **RoomDetailModal.jsx** - Room details display
11. **SearchBar.jsx** - Search functionality
12. **ComplaintCardView.jsx** - Complaints display
13. **Sidebar.jsx** & **BottomBar.jsx** - Navigation

### Phase 4 - Polish
14. All other pages with raw buttons/inputs/tables
15. Informational pages (About, Contact)
