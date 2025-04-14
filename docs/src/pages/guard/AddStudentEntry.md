# Add Student Entry Page (`/src/pages/guard/AddStudentEntry.jsx`)

This page allows security guards to record student check-ins and check-outs, either by scanning a QR code or manually entering information.

## Route

Likely corresponds to the `/guard/add-entry` route, but also embedded within the `/guard/dashboard`.

## Purpose and Functionality

1.  **Entry Method Selection:** Uses tabs to switch between two modes:
    - **QR Scanner:** Renders the [`QRScanner`](../../components/guard/QRScanner.md) component.
    - **Manual Entry:** Renders the [`NewEntryForm`](../../components/guard/NewEntryForm.md) component.
2.  **QR Code Scanning:**
    - The `QRScanner` component handles the camera feed and QR code detection.
    - On successful scan, `handleQRScanSuccess` is called, updating the `scannedStudent` state (though this state doesn't seem directly used elsewhere in this component's render).
    - The `QRScanner` likely handles the actual entry submission internally upon successful scan.
3.  **Manual Entry:**
    - The `NewEntryForm` provides fields for entering student details (e.g., roll number) and entry type (In/Out).
    - Form submission triggers `handleAddEntry`.
4.  **Entry Submission:**
    - The `handleAddEntry` function takes the `newEntry` data (likely from the form).
    - It adds the `hostelId` from the `securityInfo` context (obtained via `useSecurity`).
    - Calls `securityApi.addStudentEntry` to save the record.
    - On success, it refreshes the list of recent entries (`fetchRecentEntries`).
5.  **Recent Entries Display:**
    - Fetches recent student entries using `securityApi.getRecentStudentEntries` on component mount and after successful entry submission.
    - Displays these entries using the [`StudentEntryTable`](../../components/guard/StudentEntryTable.md).

## Context Usage

- **`useSecurity`** (from `../../contexts/SecurityProvider`):
  - `securityInfo`: To retrieve the `hostelId` associated with the guard's location.

## Key Components Rendered

- [`QRScanner`](../../components/guard/QRScanner.md) (conditionally rendered)
- [`NewEntryForm`](../../components/guard/NewEntryForm.md) (conditionally rendered)
- [`StudentEntryTable`](../../components/guard/StudentEntryTable.md)

## API Usage

- `securityApi.getRecentStudentEntries()`
- `securityApi.addStudentEntry(entryData)`

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaQrcode`, `FaRegKeyboard`, `FaHistory`, `FaInfoCircle`
- `../../contexts/SecurityProvider`
- `../../services/apiService`: `securityApi`
- `../../components/guard/StudentEntryTable`
- `../../components/guard/NewEntryForm`
- `../../components/guard/QRScanner`
