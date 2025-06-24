// components/sleep/SleepTable.tsx

import { useState, useMemo } from 'react';
import {
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sleep } from '../../hooks/useSleepData';
import { cn } from '@/lib/utils';

const columnHelper = createColumnHelper<Sleep>();

export function SleepTable({
                               sleepRecords,
                               deleteSleepRecord,
                           }: {
    sleepRecords: Sleep[];
    deleteSleepRecord: (id: string) => void;
}) {
    console.log("📊 SleepTable rendered. Records:", sleepRecords);

    // Define columns
    const columns = useMemo(() => [
        columnHelper.accessor('date', { header: 'Date' }),
        columnHelper.accessor('hoursSlept', {
            header: 'Hours Slept',
            cell: info => `${info.getValue().toFixed(1)}h`
        }),
        columnHelper.accessor('qualityRating', {
            header: 'Quality',
            cell: info => `${info.getValue()}/10`
        }),
        columnHelper.accessor('startTime', { header: 'Sleep Time' }),
        columnHelper.accessor('endTime', { header: 'Wake Time' }),
        columnHelper.accessor('notes', { header: 'Notes' }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        deleteSleepRecord(row.original.id);
                        toast.success('Sleep record deleted!');
                    }}
                >
                    Delete
                </Button>
            ),
        }),
    ], [deleteSleepRecord]);

    // Get sorted records (newest first)
    const sortedRecords = useMemo(() => {
        return [...sleepRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [sleepRecords]);

    // Create table instance
    const table = useReactTable({
        data: sortedRecords,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto space-y-4">
            <h2 className="text-xl font-semibold">Sleep History</h2>

            {sleepRecords.length === 0 ? (
                <p className="text-gray-500 italic">No sleep records yet. Start tracking your sleep above!</p>
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
                                    ? "bg-green-50 dark:bg-green-900/20"
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