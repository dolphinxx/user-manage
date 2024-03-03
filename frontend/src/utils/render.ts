export const renderDate = (date: number | Date | null | undefined) => {
    if(!date) {
        return '';
    }
    if (typeof date === 'number') {
        date = new Date(date);
    }
    return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}
