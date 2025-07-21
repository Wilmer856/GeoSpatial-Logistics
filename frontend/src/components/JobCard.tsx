import React, { useState } from "react";
import { JobIn, JobOut } from "@/types/jobs";

interface JobCardProps {
  job: JobIn | JobOut;
  isOptimized: boolean;
  onEdit: (jobId: string, updatedJob: Partial<JobIn>) => void;
  onDelete: (jobId: string) => void;
}

export default function JobCard({
  job,
  isOptimized,
  onEdit,
  onDelete,
}: JobCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: job.id,
    priority: job.priority,
    estimated_time: job.estimated_time.toString(),
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const estimatedTime = parseInt(editData.estimated_time);
    if (isNaN(estimatedTime) || estimatedTime < 1) {
      alert("Please enter a valid estimated time");
      return;
    }

    onEdit(job.id, {
      priority: editData.priority,
      estimated_time: estimatedTime,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      id: job.id,
      priority: job.priority,
      estimated_time: job.estimated_time.toString(),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete job "${job.id}"?`)) {
      onDelete(job.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const optimizedJob = job as JobOut;

  const displayAddress =
    job.address && job.address.length > 40
      ? `${job.address.substring(0, 40)}...`
      : job.address || "Address not available";

  return (
    <div className="card card-bordered bg-base-100 w-full">
      <div className="card-body p-3 sm:p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {isOptimized && (
              <div className="text-sm font-semibold text-primary mb-1">
                Stop #{optimizedJob.route_position}
              </div>
            )}
            <h3 className="font-semibold text-base-content sm:text-lg truncate">
              {job.id}
            </h3>
            <p className="text-sm text-base-content/70 line-clamp-2 sm:line-clamp-1">
              {displayAddress}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`badge badge-sm ${getPriorityColor(job.priority)}`}
              >
                {job.priority}
              </span>
              <span className="badge badge-sm badge-neutral">
                {job.estimated_time}min
              </span>
              {isOptimized && (
                <span className="badge badge-sm badge-info">
                  ETA: {optimizedJob.eta_minutes}min
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary btn-xs sm:btn-sm"
              title="Edit job"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-3 sm:w-4 sm:h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span className="sr-only sm:not-sr-only ml-1">Edit</span>
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="btn btn-xs sm:btn-sm btn-error"
              title="Delete job"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-3 sm:w-4 sm:h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <span className="sr-only sm:not-sr-only ml-1">Delete</span>
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="space-y-3 mt-3 pt-3 border-t border-base-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label label-text-alt">Priority</label>
                <select
                  value={editData.priority}
                  onChange={(e) =>
                    setEditData({ ...editData, priority: e.target.value })
                  }
                  className="select select-bordered select-sm w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="label label-text-alt">
                  Estimated Time (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editData.estimated_time}
                  onChange={(e) =>
                    setEditData({ ...editData, estimated_time: e.target.value })
                  }
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="btn btn-primary btn-sm flex-1"
              >
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
