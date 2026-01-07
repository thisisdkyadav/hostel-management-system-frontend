# Files to Remove (Old Component Locations)

This document lists all the old component files that can be safely removed after migrating to the new `/components/ui/` structure.

> ⚠️ **Important**: Before removing these files, ensure all imports in the codebase have been updated to use the new component paths.

## Migration Steps

1. **Search and Replace Imports**: Update all import statements in the codebase
2. **Test Application**: Ensure all features work correctly with new components
3. **Remove Old Files**: Delete the files listed below
4. **Clean Up Empty Folders**: Remove any empty directories

---

## Files to Remove

### `/src/components/common/ui/` (Form Components - Moved to `/components/ui/form/`)

| Old Path | New Path | Notes |
|----------|----------|-------|
| `components/common/ui/Input.jsx` | `components/ui/form/Input.jsx` | Enhanced with size variants, icons |
| `components/common/ui/Select.jsx` | `components/ui/form/Select.jsx` | Enhanced with keyboard navigation |
| `components/common/ui/Textarea.jsx` | `components/ui/form/Textarea.jsx` | Added character count |
| `components/common/ui/Checkbox.jsx` | `components/ui/form/Checkbox.jsx` | Custom styled |
| `components/common/ui/FileInput.jsx` | `components/ui/form/FileInput.jsx` | Added hidden mode |

### `/src/components/common/` (Core Components)

| Old Path | New Path | Notes |
|----------|----------|-------|
| `components/common/Button.jsx` | `components/ui/button/Button.jsx` | Full rewrite with all variants |
| `components/common/Card.jsx` | `components/ui/layout/Card.jsx` | Added sub-components |
| `components/common/Modal.jsx` | `components/ui/feedback/Modal.jsx` | Enhanced accessibility |
| `components/common/Toast.jsx` | `components/ui/feedback/Toast.jsx` | Added ToastProvider |
| `components/common/NotificationToast.jsx` | `components/ui/feedback/Toast.jsx` | Merged into Toast |
| `components/common/EmptyState.jsx` | `components/ui/feedback/EmptyState.jsx` | Same API |
| `components/common/ErrorState.jsx` | `components/ui/feedback/ErrorState.jsx` | Same API |
| `components/common/LoadingState.jsx` | `components/ui/feedback/LoadingState.jsx` | Same API |
| `components/common/LoadingScreen.jsx` | `components/ui/feedback/LoadingState.jsx` | Merged with fullScreen prop |
| `components/common/Pagination.jsx` | `components/ui/navigation/Pagination.jsx` | Added variants |
| `components/common/StatusBadge.jsx` | `components/ui/data-display/StatusBadge.jsx` | Same API |
| `components/common/StatCards.jsx` | `components/ui/data-display/StatCard.jsx` | Renamed to singular |
| `components/common/FilterTabs.jsx` | `components/ui/navigation/Tabs.jsx` | Use Tabs with pills variant |
| `components/common/SearchBar.jsx` | `components/ui/form/SearchInput.jsx` | Renamed for clarity |
| `components/common/ConfirmationDialog.jsx` | `components/ui/overlay/ConfirmDialog.jsx` | Enhanced variants |
| `components/common/FormField.jsx` | `components/ui/form/Input.jsx` | Merged with Input (use wrapper) |

### `/src/components/common/table/` (Table Components)

| Old Path | New Path | Notes |
|----------|----------|-------|
| `components/common/table/BaseTable.jsx` | `components/ui/table/Table.jsx` | Decomposed into sub-components |

---

## Components to Keep (Not Migrated - Domain Specific)

These components are domain-specific and should remain in `/components/common/`:

- `AccessDenied.jsx` - Auth/routing specific
- `CommonSuccessModal.jsx` - App-specific modal
- `CsvUploader.jsx` - Feature-specific utility
- `ImageUploadModal.jsx` - Feature-specific
- `MultiSelectDropdown.jsx` - Complex component, evaluate for migration
- `NoResults.jsx` - Can be replaced with EmptyState
- `OfflineBanner.jsx` - PWA-specific
- `PageHeader.jsx` - Layout-specific
- `PWAInstallPrompt.jsx` - PWA-specific
- `RoleFilter.jsx` - Domain-specific
- `SelectedUsersList.jsx` - Domain-specific
- `SimpleDatePicker.jsx` - Consider using external library
- `ToggleButtonGroup.jsx` - Evaluate for ButtonGroup migration
- `UserSearch.jsx` - Domain-specific
- `UserSelector.jsx` - Domain-specific

---

## Import Update Guide

### Before (Old Imports)
```jsx
import Input from "@/components/common/ui/Input"
import Select from "@/components/common/ui/Select"
import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { Pagination } from "@/components/common/Pagination"
```

### After (New Imports)
```jsx
// Option 1: Individual imports
import { Input, Select } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/feedback"
import { Pagination } from "@/components/ui/navigation"

// Option 2: All from main barrel
import { 
  Input, 
  Select, 
  Button, 
  Modal, 
  Pagination 
} from "@/components/ui"
```

---

## Cleanup Script

After updating all imports, you can run this script to remove old files:

```powershell
# PowerShell script to remove old component files
$filesToRemove = @(
    "src/components/common/ui/Input.jsx",
    "src/components/common/ui/Select.jsx",
    "src/components/common/ui/Textarea.jsx",
    "src/components/common/ui/Checkbox.jsx",
    "src/components/common/ui/FileInput.jsx",
    "src/components/common/Button.jsx",
    "src/components/common/Card.jsx",
    "src/components/common/Modal.jsx",
    "src/components/common/Toast.jsx",
    "src/components/common/NotificationToast.jsx",
    "src/components/common/EmptyState.jsx",
    "src/components/common/ErrorState.jsx",
    "src/components/common/LoadingState.jsx",
    "src/components/common/LoadingScreen.jsx",
    "src/components/common/Pagination.jsx",
    "src/components/common/StatusBadge.jsx",
    "src/components/common/StatCards.jsx",
    "src/components/common/FilterTabs.jsx",
    "src/components/common/SearchBar.jsx",
    "src/components/common/ConfirmationDialog.jsx",
    "src/components/common/FormField.jsx",
    "src/components/common/table/BaseTable.jsx"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Green
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

# Remove empty ui folder if empty
if ((Get-ChildItem "src/components/common/ui" -Force).Count -eq 0) {
    Remove-Item "src/components/common/ui" -Force
    Write-Host "Removed empty folder: src/components/common/ui" -ForegroundColor Green
}

# Remove empty table folder if empty
if ((Get-ChildItem "src/components/common/table" -Force).Count -eq 0) {
    Remove-Item "src/components/common/table" -Force
    Write-Host "Removed empty folder: src/components/common/table" -ForegroundColor Green
}
```

---

## Backward Compatibility Notes

For gradual migration, you can create re-export files in old locations:

```jsx
// src/components/common/ui/Input.jsx (temporary re-export)
export { Input as default, Input } from "@/components/ui/form"
console.warn('Deprecated: Import Input from @/components/ui/form instead')
```

This allows existing code to work while you migrate imports.
