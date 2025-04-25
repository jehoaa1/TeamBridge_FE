import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getTeam } from "../../lib/api";
import type { TeamDetail } from "../../types/auth";

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    try {
      const teamData = await getTeam(id as string);
      setTeam(teamData);
    } catch (err: any) {
      console.error("Error loading team:", err);
      if (err?.response?.status === 401) {
        router.push("/login");
      } else {
        setError("팀 정보를 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  if (!team) {
    return <div className="p-4 text-center text-gray-500">팀을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            목록으로
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">팀 정보</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">팀 ID</p>
                <p className="mt-1 text-sm text-gray-900">{team._id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">생성일</p>
                <p className="mt-1 text-sm text-gray-900">{new Date(team.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">설명</h3>
            <p className="mt-2 text-sm text-gray-600">{team.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">팀원 목록</h3>
            <div className="mt-2">
              {team.members && team.members.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {team.members.map((member) => (
                    <li key={member._id} className="py-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">등록된 팀원이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
