import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { AuditLog } from '@/lib/services/audit-log.service'

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'adminUsername',
    header: 'Admin',
  },
  {
    accessorKey: 'action',
    header: 'Hành động',
    cell: ({ row }) => (
      <Badge variant="secondary" className="uppercase">
        {row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: 'targetType',
    header: 'Loại đối tượng',
  },
  {
    accessorKey: 'targetId',
    header: 'Đối tượng ID',
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
    cell: ({ row }) => (
      <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap">
        {row.original.note || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Thời gian',
    cell: ({ row }) => (
      <span className="text-sm text-slate-600">
        {new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date(row.original.createdAt))}
      </span>
    ),
  },
]
