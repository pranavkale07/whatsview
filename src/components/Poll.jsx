import React from 'react';

/**
 * Poll Component
 * Renders WhatsApp poll messages with vote counts and progress bars
 */
function Poll({ pollData }) {
  if (!pollData || !pollData.options || pollData.options.length === 0) {
    return null;
  }

  const { title, options, totalVotes, maxVotes } = pollData;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 max-w-sm">
      {/* Poll Title */}
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">📊</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      {/* Poll Options */}
      <div className="space-y-2">
        {options.map((option, index) => {
          const percentage = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
          const votePercentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              {/* Option Text and Vote Count */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-200 truncate flex-1 mr-2">
                  {option.text}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {option.votes}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Vote Percentage */}
              <div className="text-xs text-gray-400 text-right">
                {votePercentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Votes */}
      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Total votes:</span>
          <span className="font-medium">{totalVotes}</span>
        </div>
      </div>
    </div>
  );
}

export default Poll;
