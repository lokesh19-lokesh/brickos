import React, { useState, useEffect } from 'react';
import { Shield, History, Filter } from 'lucide-react';
import { dbStore } from '@/services/mockDatabase';
import { AuditLogItem } from '@/types';
import { formatDate } from '@/utils/formatters';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  const loadLogs = () => {
    setLogs(dbStore.get('auditLogs'));
  };

  useEffect(() => {
    loadLogs();
    const unsub = dbStore.subscribe(() => {
      loadLogs();
    });
    return unsub;
  }, []);

  const columns: Column<AuditLogItem>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 font-medium">
          {formatDate(row.timestamp, 'dd MMM yyyy, hh:mm a')}
        </span>
      ),
    },
    {
      header: 'User & Role',
      accessorKey: 'userName',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.userName}</div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{row.userRole}</span>
        </div>
      ),
    },
    {
      header: 'Module',
      accessorKey: 'module',
      cell: (row) => <Badge variant="charcoal">{row.module}</Badge>,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (row) => {
        let variant: 'success' | 'danger' | 'warning' | 'info' = 'info';
        if (row.action === 'CREATE') variant = 'success';
        if (row.action === 'DELETE') variant = 'danger';
        if (row.action === 'UPDATE') variant = 'warning';
        return <Badge variant={variant}>{row.action}</Badge>;
      },
    },
    {
      header: 'Operation Details',
      accessorKey: 'details',
      cell: (row) => <span className="text-xs text-slate-700 max-w-lg block truncate">{row.details}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Security & Audit Logs"
        description="Immutable real-time audit trail capturing all system events across multi-tenant factories."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Audit Logs' },
        ]}
      />

      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Search audit events by user, module or details..."
        searchKey="details"
        exportFileName="platform-audit-logs"
      />
    </div>
  );
};
