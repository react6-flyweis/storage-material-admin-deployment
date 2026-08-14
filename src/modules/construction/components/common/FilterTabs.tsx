export default function FilterTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const baseBtn =
    "relative lg:w-56 sm:w-40 w-32 text-white font-medium transition-all";

  return (
    <div className=" flex h-10 bg-[#89D5DC] overflow-hidden">
      <button
        onClick={() => setActiveTab("today")}
        className={`${baseBtn} ${activeTab === "today" ? "bg-[#89D5DC]" : "bg-[#6B93CE99]"
          }`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)",
        }}
      >
        Today
      </button>

      <button
        onClick={() => setActiveTab("week")}
        className={`${baseBtn} -ml-8 ${activeTab === "week" ? "bg-[#89D5DC]" : "bg-[#6B93CE]"
          }`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 30px 100%)",
        }}
      >
        Week
      </button>

      <button
        onClick={() => setActiveTab("month")}
        className={`${baseBtn} -ml-8 ${activeTab === "month" ? "bg-[#89D5DC]" : "bg-[#4A72B7]"
          }`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 100%, 30px 100%)",
        }}
      >
        Month
      </button>
    </div>
  );
}
