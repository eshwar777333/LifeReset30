/**
 * Utility functions for exporting data in various formats.
 */

/**
 * Exports data as a JSON file.
 * @param data - The data to export.
 * @param filename - The name of the exported file.
 */
export function exportAsJson(data: unknown, filename: string = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Exports data as a CSV file.
 * @param rows - Array of objects representing rows.
 * @param filename - The name of the exported file.
 */
export function exportAsCsv(rows: Record<string, any>[], filename: string = 'data.csv') {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map(row =>
            headers.map(field => {
                const value = row[field] ?? '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}