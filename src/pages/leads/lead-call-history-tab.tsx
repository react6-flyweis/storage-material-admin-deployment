type Lead = {
  id: string;
  name: string;
};

type CallHistoryItem = {
  id: string;
  date: string;
  time: string;
  callsCount: number;
};

type Props = {
  lead: Lead;
};

const mockCallHistory: CallHistoryItem[] = [
  {
    id: "call-1",
    date: "May 1, 2026",
    time: "9.00 PM",
    callsCount: 2,
  },
  {
    id: "call-2",
    date: "May 1, 2026",
    time: "9.00 PM",
    callsCount: 2,
  },
];

export default function LeadCallHistoryTab({ lead }: Props) {
  const totalCalls = mockCallHistory.reduce(
    (sum, item) => sum + item.callsCount,
    0,
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">
          Call History
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {lead.name} • {lead.id} • {totalCalls} total calls
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-4">
          {mockCallHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-2 text-gray-700 sm:grid-cols-[1.1fr_0.9fr_0.7fr] sm:items-center sm:gap-3">
                <div className="text-base font-normal text-gray-700">
                  {item.date}
                </div>
                <div className="text-base font-normal text-gray-700">
                  {item.time}
                </div>
                <div className="text-base font-medium text-gray-600 sm:text-center bg-gray-200 py-1 px-3 rounded-full inline-flex max-w-max">
                  {item.callsCount} Calls
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
