# Room Management Modal Component (`/src/components/admin/hostel/RoomManagementModal.jsx`)

This component renders a modal dedicated to managing the rooms within a specific hostel.

## Purpose and Functionality

1.  **Modal Display:** Wraps the content within a common `Modal` component, displaying the hostel name in the title.
2.  **Tabbed Interface:** Uses the [`FilterTabs`](../../common/FilterTabs.md) component to create two main sections:
    - **View Existing Rooms:** Active when `activeTab` state is "view". Renders the [`ExistingRoomsList`](./rooms/ExistingRoomsList.md) component, passing the `hostel`, `onRoomsUpdated` callback, and an `setIsLoading` setter.
    - **Add New Rooms:** Active when `activeTab` state is "add". This section further contains toggle buttons to choose the input method.
3.  **Add Room Methods:** Within the "Add New Rooms" tab:
    - **Toggle Buttons:** Allows switching between "Form Input" and "CSV Import" using buttons, updating the `inputMethod` state.
    - **Form Input (`inputMethod === 'form'`):** Conditionally renders the [`AddRoomForm`](./rooms/AddRoomForm.md) component.
    - **CSV Import (`inputMethod === 'csv'`):** Conditionally renders the [`AddRoomsCsv`](./rooms/AddRoomsCsv.md) component.
    - Both `AddRoomForm` and `AddRoomsCsv` receive the `hostel`, `onRoomsUpdated` callback, and `setIsLoading` setter.
4.  **State Management:**
    - `activeTab` (String): Tracks the currently selected main tab ('view' or 'add').
    - `inputMethod` (String): Tracks the selected method for adding rooms ('form' or 'csv').
    - `isLoading` (Boolean): State passed down to child components (`ExistingRoomsList`, `AddRoomForm`, `AddRoomsCsv`) which they can set to true/false, potentially for showing loading indicators within those specific components (though the modal itself doesn't directly use it for a global overlay).
5.  **Null Check:** Returns `null` (renders nothing) if the `hostel` prop is not provided.
6.  **Close Button:** Includes a standard "Close" button using the common `Button` component, which triggers the `onClose` prop.

## Props

- `hostel` (Object): The hostel object whose rooms are to be managed. If not provided, the modal won't render.
- `onClose` (Function): Callback function invoked when the user clicks the "Close" button or closes the modal via the `Modal` component's mechanisms.
- `onRoomsUpdated` (Function): A callback function passed down to child components (`ExistingRoomsList`, `AddRoomForm`, `AddRoomsCsv`). It is intended to be called by these children when they successfully add, update, or delete rooms, allowing the parent of `RoomManagementModal` (e.g., `EditHostelModal` or a hostel details page) to react, perhaps by refreshing data.

## State Management

- `activeTab`: 'view' | 'add'
- `inputMethod`: 'form' | 'csv'
- `isLoading`: Boolean (managed by child components)

## Key Components Rendered

- [`Modal`](../../common/Modal.md)
- [`FilterTabs`](../../common/FilterTabs.md)
- [`ExistingRoomsList`](./rooms/ExistingRoomsList.md) (conditionally)
- [`AddRoomForm`](./rooms/AddRoomForm.md) (conditionally)
- [`AddRoomsCsv`](./rooms/AddRoomsCsv.md) (conditionally)
- [`Button`](../../common/Button.md)

## Dependencies

- `react`: `useState`, `useEffect` (Note: `useEffect` is imported but not used in the snippet)
- `react-icons/fa`: `FaTable`, `FaEdit`
- `../../common/Modal`
- `../../common/Button`
- `../../common/FilterTabs`
- `./rooms/ExistingRoomsList`
- `./rooms/AddRoomForm`
- `./rooms/AddRoomsCsv`
