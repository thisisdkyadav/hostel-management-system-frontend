import NoResults from "../common/NoResults"
import Pagination from "../common/Pagination"
import { FaCalendarAlt } from "react-icons/fa"

// Helper function to get status colors using theme variables
const getStatusStyle = (status) => {
  switch (status) {
    case "Approved":
      return {
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success-text)'
      }
    case "Rejected":
      return {
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger-text)'
      }
    default: // Pending
      return {
        backgroundColor: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)'
      }
  }
}

const LeavesListView = ({ leaves, onViewDetails }) => {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: `var(--border-1) solid var(--color-border-light)` }}>
      <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
          <tr>
            <th style={{ padding: 'var(--table-cell-padding-md)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Requested By</th>
            <th style={{ padding: 'var(--table-cell-padding-md)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Reason</th>
            <th style={{ padding: 'var(--table-cell-padding-md)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Period</th>
            <th style={{ padding: 'var(--table-cell-padding-md)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>Status</th>
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {leaves.map((leave, index) => (
            <tr key={leave.id || leave._id || index} style={{ cursor: 'pointer', borderBottom: `var(--border-1) solid var(--table-border)` }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => onViewDetails(leave)}
            >
              <td style={{ padding: 'var(--table-cell-padding-md)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}</td>
              <td style={{ padding: 'var(--table-cell-padding-md)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{leave.reason}</td>
              <td style={{ padding: 'var(--table-cell-padding-md)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
              </td>
              <td style={{ padding: 'var(--table-cell-padding-md)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ ...getStatusStyle(leave.status), padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-xs)', fontWeight: 'var(--font-weight-medium)' }}>{leave.status || "Pending"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const LeavesCardView = ({ leaves, onViewDetails }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--gap-md)' }}>
      {leaves.map((leave, index) => (
        <div key={leave.id || leave._id || index} style={{ backgroundColor: 'var(--color-bg-primary)', border: `var(--border-1) solid var(--color-border-light)`, borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-4)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'var(--transition-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
          onClick={() => onViewDetails(leave)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}>
              <FaCalendarAlt style={{ marginRight: 'var(--spacing-2)' }} />
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{leave.requestedBy?.name || leave.user?.name || leave.userId?.name || "Me"}</span>
            </div>
            <span style={{ ...getStatusStyle(leave.status), padding: 'var(--badge-padding-sm)', borderRadius: 'var(--radius-full)', fontSize: 'var(--badge-font-xs)', fontWeight: 'var(--font-weight-medium)' }}>{leave.status || "Pending"}</span>
          </div>
          <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{leave.reason}</div>
          <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}

const LeavesContent = ({ loading, leaves, viewMode, filters, totalPages, updateFilter, onViewDetails, paginate }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{ position: 'relative', width: '4rem', height: '4rem' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid var(--color-border-gray)', borderRadius: 'var(--radius-full)' }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite', borderTopColor: 'transparent' }}></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {leaves.length > 0 ? (
        <>
          <div style={{ marginTop: 'var(--spacing-6)' }}>{viewMode === "list" ? <LeavesListView leaves={leaves} onViewDetails={onViewDetails} /> : <LeavesCardView leaves={leaves} onViewDetails={onViewDetails} />}</div>

          {totalPages > 1 && <Pagination currentPage={filters.page} totalPages={totalPages} paginate={paginate} />}
        </>
      ) : (
        <div style={{ marginTop: 'var(--spacing-12)' }}>
          <NoResults icon={<FaCalendarAlt style={{ color: 'var(--color-text-disabled)', fontSize: 'var(--font-size-5xl)' }} />} message="No leaves found" suggestion="Try changing filter criteria or create a leave" />
        </div>
      )}
    </>
  )
}

export default LeavesContent
