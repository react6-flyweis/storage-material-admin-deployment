import React, { useEffect } from "react";
import { useNavigate, useParams, Outlet, useLocation } from "react-router";
import { useGetLoadPlanningStateQuery } from "@/modules/plant/load-planning.hooks";

const ProjectLoadPlanningView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: stateData, isLoading, isError } = useGetLoadPlanningStateQuery(projectId || "", {
    skip: !projectId,
  });

  useEffect(() => {
    if (!projectId) return;

    const isRootPath =
      location.pathname === `/plant/load-planning/${projectId}` ||
      location.pathname === `/plant/load-planning/${projectId}/` ||
      location.pathname === `/plant/load-planning/${projectId}/start-load-planning` ||
      location.pathname === `/plant/load-planning/${projectId}/start-load-planning/`;

    if (!isRootPath) return;

    if (!isLoading && !stateData) {
      navigate(`/plant/load-planning/${projectId}/item-analysis`, { replace: true });
      return;
    }

    if (isLoading || isError || !stateData) return;

    if (stateData.packingListPlan?.status === "confirmed") {
      navigate(`/plant/load-planning/${projectId}/load-plan-review`, { replace: true });
      return;
    }
    if (stateData.packingListPlan) {
      navigate(`/plant/load-planning/${projectId}/truck-optimizer`, { replace: true });
      return;
    }
    if (stateData.bundlePlan) {
      navigate(`/plant/load-planning/${projectId}/bundle-planner`, { replace: true });
      return;
    }
    navigate(`/plant/load-planning/${projectId}/item-analysis`, { replace: true });

  }, [projectId, stateData, isLoading, isError, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E51A4]" />
      </div>
    );
  }

  return <Outlet />;
};

export default ProjectLoadPlanningView;
