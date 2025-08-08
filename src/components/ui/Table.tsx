import React from 'react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  mobileCardView?: boolean;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  loading = false,
  mobileCardView = true
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200">
            <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
          </div>
          <div className="divide-y divide-secondary-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-secondary-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-secondary-600">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile card view
  if (mobileCardView) {
    return (
      <div className={`space-y-4 md:hidden ${className}`}>
        {data.map((row, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-4 ${
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={() => onRowClick?.(row, index)}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start py-2 first:pt-0 last:pb-0">
                <span className="font-medium text-secondary-700 text-sm">{column.header}:</span>
                <div className={`text-right ${column.className || ''}`}>
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : row[column.key] || '-'}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-secondary-50' : ''} ${
                  index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'
                }`}
                onClick={() => onRowClick?.(row, index)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
