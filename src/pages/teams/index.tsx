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
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [teamsData, employeesData] = await Promise.all([getTeams(), getEmployees()]);
      console.log("Teams loaded:", teamsData);
      console.log("Employees loaded:", employeesData);

      // 검색어로 필터링
      const filteredTeams =
        teamsData?.filter(
          (team) =>
            team.name.toLowerCase().includes(searchParams.search.toLowerCase()) ||
            team.description.toLowerCase().includes(searchParams.search.toLowerCase())
        ) || [];

      setTeams(filteredTeams);
      setEmployees(employeesData || []);
    } catch (err: any) {
      console.error("Error loading data:", err);
      if (err?.response?.status === 401) {
        router.push("/login");
      } else {
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamClick = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdTeam = await createTeam(newTeam);
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
    <div className="space-y-6">
      {/* 검색 섹션 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="팀 이름 또는 설명으로 검색"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchParams.search}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => router.push("/teams/create")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            disabled={isLoading}
          >
            새 팀 만들기
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {isCreating && !isLoading && employees.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
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

      {isCreating && isLoading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-gray-500">직원 정보를 불러오는 중...</div>
        </div>
      )}

      {isCreating && !isLoading && employees.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-gray-500">등록된 직원이 없습니다. 먼저 직원을 등록해주세요.</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">로딩 중...</div>
        ) : teams.length === 0 ? (
          <div className="p-4 text-center text-gray-500">등록된 팀이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    팀 ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    팀명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    설명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    팀원
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    생성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => handleTeamClick(team._id)}
                    >
                      {team._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{team.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{team.memberCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
