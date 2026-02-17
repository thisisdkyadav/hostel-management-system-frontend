import useVersionCheck from "../../hooks/useVersionCheck"

const AppUpdatePrompt = () => {
  const { updateAvailable, handleUpdate, isRefreshing } = useVersionCheck({
    checkInterval: 30 * 1000,
  })

  if (!updateAvailable) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1200] w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">Update available</p>
      <p className="mt-1 text-xs text-slate-600">A new version is ready. Refresh to load the latest build.</p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isRefreshing}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  )
}

export default AppUpdatePrompt
