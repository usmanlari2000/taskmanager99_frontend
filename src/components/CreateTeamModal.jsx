import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateTeamModal({ isOpen, onClose, onRefresh }) {
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeamName("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) return setError("Team name is required");

    setIsLoading(true);
    setError("");

    try {
      await axios.post("/teams", { name: teamName });
      onRefresh();
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || "Failed to create team";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Team</DialogTitle>
          <DialogDescription>
            Create a new team. You will be added as the creator.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter className="border-none pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white bg-black"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
