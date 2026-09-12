/**
 * Inline "New" chip for sidebar rows. A slow sheen reads as live without
 * animating the whole row. Corner stickers for chrome used to live here;
 * those controls are no longer new.
 */
const NewTag = () => (
  <span className="sidebar-new-tag relative isolate overflow-hidden px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider rounded-md shrink-0 bg-[var(--color-success)] text-white">
    New
  </span>
)

export { NewTag }
export default NewTag
