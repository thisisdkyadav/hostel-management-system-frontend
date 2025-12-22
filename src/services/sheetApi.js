import { baseUrl } from "../constants/appConstants"

export const sheetApi = {
    getHostelSheetData: async (hostelId) => {
        const response = await fetch(`${baseUrl}/sheet/hostel/${hostelId}`, {
            method: "GET",
            credentials: "include",
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to get hostel sheet data")
        }

        return response.json()
    },
}
