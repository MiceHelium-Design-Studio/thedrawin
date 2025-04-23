
interface DrawCompleteProps {
  status: 'completed' | 'upcoming' | 'active';
  winner?: string;
}

export const DrawComplete = ({ status, winner }: DrawCompleteProps) => {
  return (
    <div className="text-center py-6">
      <p className="text-lg font-medium mb-2">
        {status === 'completed'
          ? 'This draw has ended'
          : 'This draw has not started yet'}
      </p>
      {status === 'completed' && winner && (
        <div className="mt-4">
          <h3 className="text-sm text-gray-500">Winner</h3>
          <p className="text-gold text-xl font-bold">{winner}</p>
        </div>
      )}
    </div>
  );
};
