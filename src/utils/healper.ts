const calculateRentalDays = (startDate: string, endDate: string) =>  {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.floor(
    (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
}

export { calculateRentalDays }