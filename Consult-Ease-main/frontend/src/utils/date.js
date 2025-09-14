export const formatDate = (dateString) => {
	let date = new Date(dateString);
	
	if (isNaN(date.getTime())) {
		date = new Date();
		date.setDate(date.getDate() - 10);
	}

	return date.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};
