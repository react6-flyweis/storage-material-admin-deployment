import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router";

export interface DeliveryDataItem {
  name: string;
  value: number;
  color: string;
}

export interface DeliveryOverviewChartProps {
  deliveryData: DeliveryDataItem[];
  todaysDeliveries: number;
  onViewAll?: () => void;
}

export default function DeliveryOverviewChart({
  deliveryData,
  todaysDeliveries,
  onViewAll,
}: DeliveryOverviewChartProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate("/admin/construction/deliveries");
    }
  };

  return (
    <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1E293B] text-base">Delivery Overview</h3>
        <button
          onClick={handleViewAll}
          className="text-xs text-[#64748B] border border-[#E2E8F0] px-2.5 py-1 rounded-md font-medium hover:bg-gray-50"
        >
          View All
        </button>
      </div>

      {/* Donut Chart */}
      <div className="relative h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deliveryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {deliveryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-[#64748B]">Today's<br />Deliveries</span>
          <span className="text-xl font-bold text-[#1E293B]">{todaysDeliveries}</span>
        </div>
      </div>

      {/* Legend Table */}
      <div className="space-y-2 mt-4 text-xs">
        {deliveryData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#64748B] font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-[#1E293B]">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
