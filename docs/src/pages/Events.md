# Events Page (`/src/pages/Events.jsx`)

This page displays a list of upcoming and past events, with options for filtering, searching, and adding new events (for Admins).

## Route

Likely corresponds to a route like `/events`.

## Purpose and Functionality

1.  **Display Events:** Fetches all events using `eventsApi.getAllEvents` and displays them using the [`EventCard`](../components/events/EventCard.md) component in a grid layout.
2.  **Data Fetching:** Fetches the full list of events on component mount using `useEffect` and `eventsApi.getAllEvents`.
3.  **Filtering:**
    - Uses [`FilterTabs`](../components/common/FilterTabs.md) to filter events by status (All, Upcoming, Past) based on the event's `dateAndTime` compared to the current time.
    - Filtering logic is handled client-side within the `filterEvents` utility function.
4.  **Searching:**
    - Includes a [`SearchBar`](../components/common/SearchBar.md) to filter events based on a search term.
    - Search logic is handled client-side within the `filterEvents` function, matching against `eventName` and `description`.
5.  **Statistics:** Displays event statistics (likely counts of upcoming/past/total) using the [`EventStats`](../components/events/EventStats.md) component.
6.  **Add Event (Admin):**
    - An admin-only button ("Add Event") opens the [`AddEventModal`](../components/events/AddEventModal.md).
    - Successful event creation in the modal triggers a refetch of the events list (`fetchEvents`).
7.  **State Management:** Uses `useState` to manage the full list of events, the active filter tab, the search term, and the visibility of the add event modal.
8.  **Access Control:** Uses `useAuth` to check the user's role (`Admin`) to conditionally render the "Add Event" button and the `AddEventModal`.
9.  **UI Feedback:** Displays a [`NoResults`](../components/common/NoResults.md) component if no events match the current filter and search criteria.

## Utility Functions

- `filterEvents(events, filter, searchTerm)`: A local utility function that takes the full list of events, the active filter tab (`all`, `upcoming`, `past`), and the search term, and returns the filtered list of events.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To check the user's role for access control.

## Key Components Rendered

- [`EventStats`](../components/events/EventStats.md)
- [`FilterTabs`](../components/common/FilterTabs.md)
- [`SearchBar`](../components/common/SearchBar.md)
- [`EventCard`](../components/events/EventCard.md) (multiple instances)
- [`NoResults`](../components/common/NoResults.md) (conditionally rendered)
- [`AddEventModal`](../components/events/AddEventModal.md) (conditionally rendered, Admin only)

## API Usage

- `eventsApi.getAllEvents()`

## Constants

- `EVENT_FILTER_TABS`: An array defining the labels, values, and colors for the filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaPlus`, `FaCalendarAlt`
- `../contexts/AuthProvider`
- `../services/apiService`: `eventsApi`
- Multiple components from `/src/components/common` and `/src/components/events`
