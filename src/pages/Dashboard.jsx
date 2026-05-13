import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, LayoutDashboard, Users, Menu } from "lucide-react";

import TaskModal from "../components/TaskModal";
import AddMemberModal from "../components/AddMemberModal";
import CreateTeamModal from "../components/CreateTeamModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [activeTeamId, setActiveTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/teams");
      let fetchedTeams = res.data;
      if (res.data && !Array.isArray(res.data)) {
        fetchedTeams =
          res.data.teams || res.data.data || Object.values(res.data)[0];
      }
      fetchedTeams = Array.isArray(fetchedTeams) ? fetchedTeams : [];

      setTeams(fetchedTeams);
      if (!activeTeamId && fetchedTeams.length > 0) {
        setActiveTeamId(fetchedTeams[0].id);
      }
    } catch (err) {
      console.error("Error fetching teams: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (teamId) => {
    if (!teamId) return;
    try {
      const res = await axios.get(`/tasks/${teamId}`);
      let fetchedTasks = res.data;
      if (res.data && !Array.isArray(res.data)) {
        fetchedTasks =
          res.data.tasks || res.data.data || Object.values(res.data)[0];
      }
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
    } catch (err) {
      console.error("Error fetching tasks: ", err);
    }
  };

  const fetchMembers = async (teamId) => {
    if (!teamId) return;
    try {
      const res = await axios.get(`/teams/${teamId}/members`);
      let fetchedMembers = res.data;
      if (res.data && !Array.isArray(res.data)) {
        fetchedMembers =
          res.data.members ||
          res.data.users ||
          res.data.data ||
          Object.values(res.data)[0];
      }
      setMembers(Array.isArray(fetchedMembers) ? fetchedMembers : []);
    } catch (err) {
      console.error("Error fetching members: ", err);
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (activeTeamId) {
      fetchTasks(activeTeamId);
      fetchMembers(activeTeamId);
    }
  }, [activeTeamId]);

  const activeTeam = teams.find((t) => t.id === activeTeamId);

  const uniqueAssignees = [
    ...new Set(tasks.map((t) => t.assignee_name).filter(Boolean)),
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (task.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAssignee =
      filterAssignee === "all" || task.assignee_name === filterAssignee;
    return matchesSearch && matchesAssignee;
  });

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh font-bold items-center justify-center">
        Loading...
      </div>
    );
  }

  const renderSidebarElements = (isMobile = false) => (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-none pb-4">
        <div className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" /> TaskManager
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden"
          >
            ✕
          </button>
        )}
      </div>
      <div className="py-4 flex-1">
        <h2 className="font-bold mb-4 mt-2 text-base">Your Teams</h2>
        <div className="space-y-1">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                setActiveTeamId(team.id);
                setFilterAssignee("all");
                setMobileSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTeamId === team.id
                  ? "text-black bg-gray-100"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
        <Button
          className="w-full mt-4 bg-black text-white hover:bg-black/90"
          onClick={() => setIsCreateTeamOpen(true)}
        >
          <Plus className="w-4 h-4" /> Create Team
        </Button>
      </div>
      <div className="pb-4">
        <Button
          className="w-full bg-red-600 text-white hover:bg-red-700"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b w-full fixed top-0 z-40">
        <div className="flex items-center gap-2 font-bold">
          <LayoutDashboard className="w-5 h-5" />
          TaskManager
        </div>
        <button onClick={() => setMobileSidebarOpen(true)}>
          <Menu />
        </button>
      </div>
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r">
        {renderSidebarElements(false)}
      </aside>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full border-r">
            {renderSidebarElements(true)}
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}
      <main className="flex-1 flex flex-col h-dvh overflow-hidden md:ml-0 pt-16 md:pt-0">
        <header className="h-24 sm:h-16 bg-white border-b flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold my-2 sm:my-0">
            {activeTeam?.name || "No Team Selected"}
          </h2>
          {activeTeam && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddMemberOpen(true)}
              >
                <Users className="w-4 h-4 mr-2" /> Add Member
              </Button>
              <Button
                className="bg-black text-white hover:bg-black/90"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Create Task
              </Button>
            </div>
          )}
        </header>
        <div className="p-4 flex gap-3 flex-wrap">
          <input
            className="border border-gray-200 bg-white px-3 py-2 ml-2 rounded-md text-sm w-full max-w-sm focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border border-gray-200 bg-white px-3 py-2 ml-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {uniqueAssignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer bg-white border border-gray-200 hover:shadow-md transition-shadow"
                onClick={() => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
              >
                <CardHeader>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === "completed"
                      ? "Completed"
                      : task.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                  </Badge>
                  <CardTitle className="text-base mt-1 leading-tight">
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {task.assignee_name || "Unassigned"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onRefresh={fetchTeams}
      />

      {activeTeamId && (
        <>
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={() => fetchTasks(activeTeamId)}
            task={editingTask}
            teamId={activeTeamId}
            members={members}
          />

          <AddMemberModal
            isOpen={isAddMemberOpen}
            onClose={() => setIsAddMemberOpen(false)}
            teamId={activeTeamId}
            teamName={activeTeam?.name}
            onMemberAdded={() => fetchMembers(activeTeamId)}
          />
        </>
      )}
    </div>
  );
}
