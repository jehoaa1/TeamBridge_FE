import { useRouter } from "next/router";
import { useState } from "react";
import { createTeam } from "../../lib/api";

export default function CreateTeam() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeam(newTeam);
      router.push("/teams");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push("/login");
      } else {
        setError("팀 생성에 실패했습니다.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">새 팀 생성</h2>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            취소
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">팀 이름</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newTeam.name}
              onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="새로운 팀 이름을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">설명</label>
            <textarea
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={newTeam.description}
              onChange={(e) => setNewTeam((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="팀에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
