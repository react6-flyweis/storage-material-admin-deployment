import React, { useState } from "react";
import DailyLogModel from "../dailyLogModel";
import NewTaskModel from "../newTaskModel";
import RightCheckIcon from "../../assets/RightTickIcon";
import SuccessModal from "./SuccessModal";
import { useSearchParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiTaskItem } from "../../construction.api";

type TaskPriority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  project: string;
  description: string;
  priority: TaskPriority;
  due?: string;
  assignee: string;
  progress?: number;
  status?: "todo" | "inProgress" | "done";
};

const priorityStyles: Record<TaskPriority, string> = {
  High: "bg-red-100 text-red-500",
  Medium: "bg-yellow-100 text-yellow-600",
  Low: "bg-green-100 text-green-600",
};

export interface TaskBoardProps {
  boardData?: {
    todo: ApiTaskItem[];
    in_progress: ApiTaskItem[];
    done: ApiTaskItem[];
  };
  loading?: boolean;
}

export default function TaskBoard({ boardData, loading = false }: TaskBoardProps) {
  const [openDailyLogModel, setDailyLogModel] = useState(false);
  const [openNewTaskModel, setNewTaskModel] = useState(false);
  const [extraTasks, setExtraTasks] = useState<{
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  }>({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [afterSuccessAction, setAfterSuccessAction] = useState<
    (() => void) | null
  >(null);

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  // Map ApiTaskItem to UI Task
  const mapApiTask = (item: ApiTaskItem): Task => {
    const rawPriority = (item.priority || "medium").toLowerCase();
    let priority: TaskPriority = "Medium";
    if (rawPriority === "high") priority = "High";
    else if (rawPriority === "low") priority = "Low";

    let due = "NA";
    if (item.dueDate) {
      due = item.dueDate.split("T")[0];
    }

    let status: "todo" | "inProgress" | "done" = "todo";
    if (item.status === "in_progress" || item.status === "inProgress") {
      status = "inProgress";
    } else if (item.status === "done") {
      status = "done";
    }

    const project = item.leadId
      ? `${item.leadId.projectName || ""}${item.leadId.jobId ? ` (${item.leadId.jobId})` : ""}`
      : "-";

    return {
      id: item._id,
      title: item.title || "Untitled Task",
      project: project.trim() || "-",
      description: item.description || "",
      priority,
      due,
      assignee: item.assignedTo?.name || "Unassigned",
      status,
    };
  };

  const todoList: Task[] = [
    ...(boardData?.todo?.map(mapApiTask) || []),
    ...extraTasks.todo,
  ];
  const inProgressList: Task[] = [
    ...(boardData?.in_progress?.map(mapApiTask) || []),
    ...extraTasks.inProgress,
  ];
  const doneList: Task[] = [
    ...(boardData?.done?.map(mapApiTask) || []),
    ...extraTasks.done,
  ];

  const filterTasksBySearch = (list: Task[]) => {
    if (!search.trim()) return list;

    const q = search.toLowerCase();

    return list.filter((task) =>
      `${task.title}
     ${task.project}
     ${task.description}
     ${task.assignee}
     ${task.priority}`
        .toLowerCase()
        .includes(q)
    );
  };

  const handleNewTask = (data: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.taskName,
      project: data.project,
      description: data.description,
      priority: capitalizeFirstLetter(data.priority) as TaskPriority,
      due: data.deadline || "NA",
      assignee: data.assignedTo,
      status: data.status,
    };

    setExtraTasks((prev) => {
      const updated = { ...prev };
      if (newTask.status === "todo") updated.todo = [newTask, ...prev.todo];
      else if (newTask.status === "inProgress")
        updated.inProgress = [newTask, ...prev.inProgress];
      else if (newTask.status === "done")
        updated.done = [newTask, ...prev.done];
      return updated;
    });
  };

  const handleDailyLogSubmit = (data: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.description || "Daily Work Log",
      project: "Project",
      description: data.description,
      progress: Number(data.progress),
      priority: "Medium",
      due: data.date || "NA",
      assignee: "You",
      status: "inProgress",
    };

    setExtraTasks((prev) => ({
      ...prev,
      inProgress: [newTask, ...prev.inProgress],
    }));
  };

  return (
    <div
      className="bg-white rounded-[8px] lg:p-6 p-3 border border-[#F3F4F6]
      shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),_0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
    >
      <div className="flex sm:flex-row flex-col gap-3 sm:justify-between sm:items-center mb-6">
        <h2 className="text-[17px] font-semibold">Task Board</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setDailyLogModel(true)}
            className="bg-[#3AB449] text-white px-6 py-2 rounded-[8px] text-[16px] font-normal cursor-pointer"
          >
            Daily Work Log
          </button>
          <button
            onClick={() => setNewTaskModel(true)}
            className="bg-[#2563EB] text-white px-6 py-2 rounded-[8px] text-[16px] font-normal cursor-pointer"
          >
            Add Task
          </button>

          <DailyLogModel
            open={openDailyLogModel}
            onClose={() => setDailyLogModel(false)}
            onSubmit={(data) => {
              setAfterSuccessAction(() => () => {
                handleDailyLogSubmit(data);
                setDailyLogModel(false);
              });
              setSuccessTitle("Work Log Added Successfully");
              setSuccessOpen(true);
            }}
          />

          <NewTaskModel
            open={openNewTaskModel}
            onSubmit={(data) => {
              setAfterSuccessAction(() => () => {
                handleNewTask(data);
                setNewTaskModel(false);
              });
              setSuccessTitle("Task Added Successfully");
              setSuccessOpen(true);
            }}
            onClose={() => setNewTaskModel(false)}
          />

          <SuccessModal
            open={successOpen}
            title={successTitle}
            onClose={() => {
              setSuccessOpen(false);
              if (afterSuccessAction) {
                afterSuccessAction();
                setAfterSuccessAction(null);
              }
            }}
          />
        </div>
      </div>

      <div className="overflow-auto scroll-hide w-[calc(100vw-50px)] lg:w-[calc(100vw-388px)]">
        <div className="grid grid-cols-3 lg:gap-6 gap-3 min-w-[800px]">
          <Column
            title={`To Do ${loading ? "" : `(${filterTasksBySearch(todoList).length})`}`}
            bg="bg-[#F9FAFB]"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <TaskCardSkeleton key={idx} />
                ))
              : filterTasksBySearch(todoList).map(renderTask)}
          </Column>

          <Column
            title={`In Progress ${loading ? "" : `(${filterTasksBySearch(inProgressList).length})`}`}
            bg="bg-[#EFF6FF]"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <TaskCardSkeleton key={idx} />
                ))
              : filterTasksBySearch(inProgressList).map(renderTask)}
          </Column>

          <Column
            title={`Done ${loading ? "" : `(${filterTasksBySearch(doneList).length})`}`}
            bg="bg-[#F0FDF4]"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <TaskCardSkeleton key={idx} />
                ))
              : filterTasksBySearch(doneList).map(renderTask)}
          </Column>
        </div>
      </div>
    </div>
  );
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function renderTask(task: Task) {
  return (
    <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-bold text-[14px] text-[#111827]">{task.title}</h3>
        {task.status === "done" ? (
          <RightCheckIcon />
        ) : (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>
        )}
      </div>

      <p className="text-[#6B7280] text-xs mb-2 font-medium">{task.project}</p>
      {task.description && (
        <p className="text-[#6B7280] text-xs mb-4">{task.description}</p>
      )}

      {typeof task.progress === "number" && (
        <>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded mb-3">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </>
      )}

      <div className="flex justify-between text-xs pt-1 border-t border-gray-50 mt-2">
        <span className="text-[#6B7280]">
          {task.due && task.due !== "NA" ? `Due ${task.due}` : "Completed"}
        </span>

        <span className="text-[#000000] font-medium">{task.assignee}</span>
      </div>
    </div>
  );
}

function Column({
  title,
  bg,
  children,
}: {
  title: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${bg} rounded-[8px] p-4 min-h-[600px] max-h-[80vh] overflow-auto scroll-hide`}
    >
      <h3 className="font-semibold mb-4 text-sm text-[#111827]">{title}</h3>
      {children}
    </div>
  );
}

