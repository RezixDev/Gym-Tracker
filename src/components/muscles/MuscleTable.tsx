// components/muscles/MuscleTable.tsx

import { useState, useMemo } from 'react';
import {
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MuscleRecord, MeasurementType, MEASUREMENT_LABELS } from '../../hooks/useMuscleData';
import { cn } from '@/lib/utils';

const columnHelper = createColumnHelper<MuscleRecord>();

export function MuscleTable({
                                muscleRecords,
                                deleteMuscleRecord,
                                measurementUnit,
                            }: {
    muscleRecords: MuscleRecord[];
    deleteMuscleRecord: (id: string) => void;
    measurementUnit: 'cm' | 'in';
}) {
    console.log("📊 MuscleTable rendered. Records:", muscleRecords);
    const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementType | 'all'>('all');

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Helper to get a measurement value safely
    const getMeasurementValue = (record: MuscleRecord, type: MeasurementType): string => {
        const value = record.measurements[type];
        return value !== undefined ? `${value.toFixed(1)} ${measurementUnit}` : '--';
    };

    // Determine which measurement columns to show
    const measurementColumns = useMemo(() => {
        if (selectedMeasurement === 'all') {
            // Show all columns would be too wide, so we'll show some common ones
            return [
                'neck', 'chest', 'leftBicep', 'rightBicep', 'waist', 'leftThigh', 'rightThigh'
            ] as MeasurementType[];
        }

        // Show just the selected measurement
        return [selectedMeasurement] as MeasurementType[];
    }, [selectedMeasurement]);

    // Define columns
    const columns = useMemo(() => {
        const baseColumns = [
            columnHelper.accessor('date', {
                header: 'Date',
                cell: info => formatDate(info.getValue())
            }),
        ];

        // Add measurement columns
        const measurementCols = measurementColumns.map(type =>
            columnHelper.accessor(
                row => row.measurements[type],
                {
                    id: type,
                    header: MEASUREMENT_LABELS[type],
                    cell: info => {
                        const value = info.getValue();
                        return value !== undefined ? `${value.toFixed(1)} ${measurementUnit}` : '--';
                    }
                }
            )
        );

        const actionColumn = [
            columnHelper.accessor('notes', {
                header: 'Notes',
                cell: info => info.getValue() || '--'
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            deleteMuscleRecord(row.original.id);
                            toast.success('Record deleted!');
                        }}
                    >
                        Delete
                    </Button>
                ),
            }),
        ];

        return [...baseColumns, ...measurementCols, ...actionColumn];
    }, [measurementColumns, deleteMuscleRecord, measurementUnit]);

    // Get sorted records (newest first)
    const sortedRecords = useMemo(() => {
        return [...muscleRecords].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [muscleRecords]);

    // Create table instance
    const table = useReactTable({
        data: sortedRecords,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Measurement History</h2>

                <select
                    value={selectedMeasurement}
                    onChange={(e) => setSelectedMeasurement(e.target.value as MeasurementType | 'all')}
                    className="border rounded-md p-2"
                >
                    <option value="all">Common Measurements</option>
                    {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {muscleRecords.length === 0 ? (
                <p className="text-gray-500 italic">No measurement records yet. Start tracking your measurements above!</p>
            ) : (
                <div className="border rounded-lg overflow-hidden">
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
                </div>
            )}
        </div>
    );
}