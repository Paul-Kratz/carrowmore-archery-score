export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

export const formatHistoryDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const timeFormatter = new Intl.DateTimeFormat("en-IE", {
    hour: "numeric",
    minute: "numeric",
  });
  const dateFormatter = new Intl.DateTimeFormat("en-IE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
};
