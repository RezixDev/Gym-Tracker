// components/stress/StressTable.tsx

import { useState, useMemo } from 'react';
import {
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StressRecord } from '../../hooks/useStressData';
import { cn } from '@/lib/utils';

const columnHelper = createColumnHelper<StressRecord>();

export function StressTable({
                                stressRecords,
                                deleteStressRecord,
                            }: {
    stressRecords: StressRecord[];
    deleteStressRecord: (id: string) => void;
}) {
    console.log("📊 StressTable rendered. Records:", stressRecords);

    // Helper function to generate stress level color
    const getStressLevelColor = (level: number) => {
        if (level <= 3) return "text-green-600 dark:text-green-400";
        if (level <= 6) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    // Define columns
    const columns = useMemo(() => [
        columnHelper.accessor('date', { header: 'Date' }),
        columnHelper.accessor('stressLevel', {
            header: 'Stress Level',
            cell: info => (
                <span className={getStressLevelColor(info.getValue())}>
                    {info.getValue()}/10
                </span>
            )
        }),
        columnHelper.accessor('workedToday', {
            header: 'Worked',
            cell: info => info.getValue() ? 'Yes' : 'No'
        }),
        columnHelper.accessor('workHours', {
            header: 'Work Hours',
            cell: info => info.getValue() > 0 ? `${info.getValue()}h` : '-'
        }),
        columnHelper.accessor('factors', {
            header: 'Factors',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue().map((factor, index) => (
                        <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                        >
                            {factor}
                        </span>
                    ))}
                </div>
            )
        }),
        columnHelper.accessor('notes', { header: 'Notes' }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        deleteStressRecord(row.original.id);
                        toast.success('Stress record deleted!');
                    }}
                >
                    Delete
                </Button>
            ),
        }),
    ], [deleteStressRecord]);

    // Get sorted records (newest first)
    const sortedRecords = useMemo(() => {
        return [...stressRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [stressRecords]);

    // Create table instance
    const table = useReactTable({
        data: sortedRecords,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto space-y-4">
            <h2 className="text-xl font-semibold">Stress History</h2>

            {stressRecords.length === 0 ? (
                <p className="text-gray-500 italic">No stress records yet. Start tracking your stress levels above!</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className={cn(
                                "hover:bg-gray-100 dark:hover:bg-gray-800",
                                row.original.date === new Date().toISOString().split('T')[0]
                                    ? "bg-blue-50 dark:bg-blue-900/20"
                                    : ""
                            )}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}