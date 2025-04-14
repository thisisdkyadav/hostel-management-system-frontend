# Lost and Found Page (`/src/pages/LostAndFound.jsx`)

This page manages the listing and addition of items reported as lost and found within the hostel.

## Route

Likely corresponds to a route like `/lost-and-found`.

## Purpose and Functionality

1.  **Display Items:** Fetches all lost and found items using `lostAndFoundApi.getAllLostItems` and displays them using the [`LostAndFoundCard`](../components/lostAndFound/LostAndFoundCard.md) component in a grid layout.
2.  **Data Fetching:** Fetches the full list of items on component mount using `useEffect` and `lostAndFoundApi.getAllLostItems`.
3.  **Filtering:**
    - Uses [`FilterTabs`](../components/common/FilterTabs.md) to filter items by status (All, Active, Claimed).
    - Filtering logic is handled client-side by the imported utility function `filterLostItems` (from `../utils/adminUtils`).
4.  **Searching:**
    - Includes a [`SearchBar`](../components/common/SearchBar.md) to filter items based on a search term.
    - Search logic is also handled client-side within the `filterLostItems` function.
5.  **Statistics:** Displays item statistics (likely counts of active/claimed/total) using the [`LostAndFoundStats`](../components/lostAndFound/LostAndFoundStats.md) component.
6.  **Add Item (Admin/Warden/Security):**
    - A button ("Add Item") visible to specified roles (Admin, Warden, Associate Warden, Security) opens the [`AddLostItemModal`](../components/lostAndFound/AddLostItemModal.md).
    - Successful item addition in the modal triggers a refetch of the items list (`fetchLostItems`).
7.  **State Management:** Uses `useState` to manage the full list of items, the active filter tab, the search term, and the visibility of the add item modal.
8.  **Access Control:** Uses `useAuth` to check the user's role to conditionally render the "Add Item" button.
9.  **UI Feedback:** Displays a [`NoResults`](../components/common/NoResults.md) component if no items match the current filter and search criteria.

## Utility Functions

- `filterLostItems(items, filter, searchTerm)` (from `../utils/adminUtils`): Imported utility function that handles client-side filtering based on status and search term.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To check the user's role for access control.

## Key Components Rendered

- [`LostAndFoundStats`](../components/lostAndFound/LostAndFoundStats.md)
- [`FilterTabs`](../components/common/FilterTabs.md)
- [`SearchBar`](../components/common/SearchBar.md)
- [`LostAndFoundCard`](../components/lostAndFound/LostAndFoundCard.md) (multiple instances)
- [`NoResults`](../components/common/NoResults.md) (conditionally rendered)
- [`AddLostItemModal`](../components/lostAndFound/AddLostItemModal.md) (conditionally rendered)

## API Usage

- `lostAndFoundApi.getAllLostItems()`

## Constants

- `LOST_FILTER_TABS`: An array defining the labels and values for the filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`, `use` (Note: `use` import might be unused or intended for future React features).
- `react-icons/fa`: `FaPlus`
- `react-icons/md`: `MdInventory`
- `../contexts/AuthProvider`
- `../services/apiService`: `lostAndFoundApi`
- `../utils/adminUtils`: `filterLostItems`
- Multiple components from `/src/components/common` and `/src/components/lostAndFound`
