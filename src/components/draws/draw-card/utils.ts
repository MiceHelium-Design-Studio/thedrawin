
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'open':
      return 'bg-green-500';
    case 'upcoming':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
    case 'open':
      return 'Active';
    case 'upcoming':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
};
