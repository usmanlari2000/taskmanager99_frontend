import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  members = [],
  teamId,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "unassigned",
    status: "pending",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignee: task.assignee_name || "unassigned",
        status: task.status || "pending",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assignee: "unassigned",
        status: "pending",
      });
    }
    setError("");
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        assignee: formData.assignee,
        status: formData.status,
      };

      if (task?.id) {
        await axios.put(`/tasks/${task.id}`, payload);
      } else {
        await axios.post("/tasks", {
          teamId,
          ...payload,
        });
      }

      onSave?.();
      onClose?.();
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to save task, try again";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {task ? "Edit Task" : "Create Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={formData.assignee}
              onValueChange={(val) =>
                setFormData({ ...formData, assignee: val })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Member" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {Array.isArray(members) &&
                  members.length > 0 &&
                  members.map((m, index) => {
                    const displayName = String(
                      m?.name ||
                        m?.user?.name ||
                        m?.email ||
                        m?.user?.email ||
                        m?.id ||
                        `Member-${index}`,
                    );

                    return (
                      <SelectItem key={index} value={displayName}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4 border-none">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
