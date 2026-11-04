import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import logo from "../assets/logo.svg";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    invoiceNumber = "2460",
    date = "2025-10-25",
    daysToPay = "15",
    items = [],
    subtotal = 0,
    taxAmount = 0,
    total = 0,
  } = location.state || {};

  const deposit = total * 0.25;

  return (
    <div className="md:px-5 px-2 md:pt-5 pb-10 space-y-6">
      {/* Top Actions */}
      <div className="flex justify-start items-center mb-3 mt-1 max-w-7xl gap-4 mr-auto">
        <Button
          variant="outline"
          className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 min-w-[100px]"
          onClick={() => navigate("/payments/new-invoice")}
        >
          Edit
        </Button>
        <Button className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[100px] gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Button>
      </div>

      <div className="bg-white rounded-[4px] p-6 sm:p-14 shadow-sm mx-auto max-w-8xl">
        <h1 className="text-center text-gray-300 font-bold text-md md:text-xl tracking-widest uppercase mb-12">
          Invoice
        </h1>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16 ">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center shrink-0">
                <img
                  src={logo}
                  alt="Logo"
                  className="md:w-29 w-20 md:h-16  object-contain"
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 leading-relaxed">
              1851 Madison Ave Suite 300
              <br />
              Council Bluffs, IA
              <br />
              51503
              <br />
              United States
              <br />
              info@steelbuildingdepot.com
              <br />
              www.steelbuildingdepot.com
            </div>
          </div>

          <div className="min-w-[200px] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Payment terms</span>
              <span className="text-gray-900">{daysToPay} days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Invoice #</span>
              <span className="text-gray-900">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Date</span>
              <span className="text-gray-900">{date}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Business/Tax #</span>
              <span className="text-gray-900">99- 4515145</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-12">
          <div className="flex justify-between border-b border-gray-800 pb-2 mb-6">
            <span className="text-xs font-bold text-gray-700">Description</span>
            <span className="text-xs font-bold text-gray-700">Total</span>
          </div>

          <div className="space-y-8">
            {items.map((item: any, index: number) => (
              <div
                key={item.id}
                className={index > 0 ? "border-t border-gray-100 pt-4" : ""}
              >
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium">
                    {item.description || "Item Description"}
                  </span>
                  {/* Calculate item total */}
                  <span className="text-xs text-gray-600">
                    $
                    {(item.rate * item.quantity).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {item.notes && (
                  <div className="text-[10px] text-gray-400 mb-2">
                    {item.notes}
                  </div>
                )}

                {/* Display Photos if any */}
                {item.photos && item.photos.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-3 mb-4">
                    {item.photos.map((photo: string, i: number) => (
                      <div
                        key={i}
                        className="w-64 h-40 overflow-hidden rounded-sm bg-gray-100"
                      >
                        {/* Use the photo URL if it looks like a blob/url, otherwise placeholder */}
                        <img
                          src={
                            photo.startsWith("blob:") ||
                            photo.startsWith("http")
                              ? photo
                              : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop"
                          }
                          alt={`Item photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Fallback to show something if no items */}
            {items.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                No items added
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-900 font-bold">Subtotal</span>
              <span className="text-gray-500">
                $
                {Number(subtotal).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-500">
                $
                {Number(taxAmount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-900 font-bold">Total</span>
              <span className="text-gray-900 font-bold">
                $
                {Number(total).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Deposit Due</span>
              <span className="text-gray-900 font-bold">
                ${deposit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="mb-16 max-w-lg ml-auto">
          <h3 className="text-xs font-bold text-gray-900 mb-4">
            Payment Schedule
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
              <span className="text-gray-500">Deposit(25%)</span>
              <span className="text-gray-500">
                $
                {(total * 0.25).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
              <span className="text-gray-500">1st payment 50% (50%)</span>
              <span className="text-gray-900 font-medium">
                $
                {(total * 0.5).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
              <span className="text-gray-500">2nd payment 20%</span>
              <span className="text-gray-500">
                $
                {(total * 0.2).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs pb-2">
              <span className="text-gray-500">Final payment (5%)</span>
              <span className="text-gray-500">
                $
                {(total * 0.05).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-[10px] text-gray-500 mb-8">
            Thank you for your business? Reach out with any questions
          </p>
          <p className="text-[10px] text-gray-500 mb-16">
            By Signing this document the customer agrees to the services and
            conditions outlined in this document
          </p>

          <div className="flex justify-end">
            <div className="border-t border-gray-400 w-64 pt-2">
              <p className="text-xs text-gray-500">Client signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
