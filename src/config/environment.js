export const appEnvironment = import.meta.env.VITE_APP_ENV?.trim().toLowerCase() || "development"

export const isProductionEnvironment = appEnvironment === "production"
