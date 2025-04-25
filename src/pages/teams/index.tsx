import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createTeam, getEmployees, getTeams } from "../../lib/api";
import { Team, User } from "../../types/auth";

export default function Teams() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("loadData");
    try {
      const [teamsData, employeesData] = await Promise.all([getTeams(), getEmployees()]);
      console.log("Teams loaded:", teamsData);
      console.log("Employees loaded:", employeesData);
      setTeams(teamsData);
      setEmployees(employeesData);
    } catch (err: any) {
      console.error("Error loading data:", err);
      if (err?.response?.status === 401) {
        router.push("/login");
      } else {
        setError("데이터를 불러오는데 실패했습니다.");
      }
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Creating team with:", newTeam);
      const createdTeam = await createTeam(newTeam);
      console.log("Team created:", createdTeam);
      setIsCreating(false);
      setNewTeam({ name: "", description: "", memberIds: [] });
      loadData();
    } catch (err: any) {
      console.error("Error creating team:", err);
      if (err?.response?.status === 401) {
        router.push("/login");
      } else {
        setError("팀 생성에 실패했습니다.");
      }
    }
  };

  const handleMemberToggle = (userId: string) => {
    setNewTeam((prev) => {
      const memberIds = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">팀 관리</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            새 팀 만들기
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {isCreating && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">새 팀 생성</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">팀 이름</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <textarea
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">팀원 선택</label>
                <div className="grid grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`employee-${employee.id}`}
                        checked={newTeam.memberIds.includes(employee.id)}
                        onChange={() => handleMemberToggle(employee.id)}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <label htmlFor={`employee-${employee.id}`} className="text-sm text-gray-700">
                        {employee.name} ({employee.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  취소
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  생성
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {teams.map((team) => (
              <li key={team.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.description}</p>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">팀원: </span>
                      {team.members.map((member) => member.name).join(", ")}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
