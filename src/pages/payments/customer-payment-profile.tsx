import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Mail, Phone, Clipboard } from "lucide-react";
import { useNavigate } from "react-router";

export default function CustomerPaymentProfile() {
  const navigate = useNavigate();
  //   const { customerId } = useParams();

  // Mock data - replace with actual data fetching
  const customer = {
    name: "Sarah Johnson",
    id: "O-2025-1047",
    workshop: "Workshop",
    location: "Texas",
    email: "sarah.johnson@company.com",
    phone: "+1(555) 123-4567",
    project: "Garage",
  };

  const invoice = {
    totalAmount: 120000,
    paidAmount: 80000,
    dueAmount: 40000,
    dueDate: "28 October 2025",
  };

  const payment = {
    completion: 67,
    completedPayments: 2,
    totalPayments: 3,
  };

  const stages = [
    { name: "Deposit", amount: 40000, status: "Completed" as const },
    { name: "Mid", amount: 40000, status: "Completed" as const },
    { name: "Final Settlement", amount: 40000, status: "Pending" as const },
  ];

  return (
    <div className="lg:pr-5 lg:pt-5 p-5 lg:p-0 space-y-5">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button onClick={() => navigate('/payments')}>
          <ArrowLeftIcon />
          <span>Back</span>
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">
          Employee Profile
        </h1>
      </div>

      {/* Customer Name and Actions */}
      <div className="bg-background rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customer.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {customer.id} — {customer.workshop} · {customer.location}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button className="rounded px-5">Send Reminder</Button>
            <Button className="px-5 bg-green-600 rounded hover:bg-green-700 ">
              Download Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Customer Information
          </h3>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{customer.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clipboard className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Project</p>
                <p className="text-sm text-gray-900">{customer.project}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Invoice Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-lg font-semibold text-gray-900">
                ${invoice.totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Paid Amount</span>
              <span className="text-lg font-semibold text-green-600">
                ${invoice.paidAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Due Amount</span>
              <span className="text-lg font-semibold text-red-600">
                ${invoice.dueAmount.toLocaleString()}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {invoice.dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Payment Progress
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion</span>
              <span className="text-lg font-bold text-gray-900">
                {payment.completion}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${payment.completion}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-600">
              {payment.completedPayments} of {payment.totalPayments} payments
              completed
            </p>
          </div>
        </div>
      </div>

      {/* Stage Tracker */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Stage Tracker
        </h3>

        <div className="flex justify-around items-center ">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  stage.status === "Completed"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              >
                {idx + 1}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{stage.name}</p>
                <p className="text-sm text-gray-600">
                  ${stage.amount.toLocaleString()}
                </p>
                <p
                  className={`text-xs font-medium mt-1 ${
                    stage.status === "Completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {stage.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Invoice list
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-200 table-fixed">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="py-4 pl-2">Invoice ID</th>
                <th className="py-4">Type</th>
                <th className="py-4">Amount</th>
                <th className="py-4">Date</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="h-10">
                  <td className="pl-2 text-gray-900">John Doe</td>
                  <td className="text-gray-500">Deposit</td>
                  <td className="text-gray-900 font-semibold">$40,000</td>
                  <td className="text-gray-500">15 Aug 2025</td>
                  <td>
                    <span className="inline-block bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm">
                      Paid
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="text-blue-600 hover:underline">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
