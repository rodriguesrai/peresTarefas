import "server-only";
import { prisma } from "@/lib/prisma";
import { isOverdue, startOfTodayUtc } from "@/features/tasks/lib/task-meta";

const DAY_MS = 24 * 60 * 60 * 1000;

export type PersonWorkload = {
  id: string;
  name: string;
  pending: number;
  inProgress: number;
  overdue: number;
  doneLastWeek: number;
};

// O escritório é pequeno: busca as tarefas em aberto e agrega em memória.
export async function getDashboard(now = new Date()) {
  const today = startOfTodayUtc(now);
  const inThreeDays = new Date(today.getTime() + 3 * DAY_MS);
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);

  const [people, openTasks, doneLastWeek] = await Promise.all([
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.task.findMany({
      where: { status: { not: "CONCLUIDA" } },
      include: { assignee: { select: { id: true, name: true } }, _count: { select: { notes: true } } },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }],
    }),
    prisma.task.groupBy({
      by: ["assigneeId"],
      where: { status: "CONCLUIDA", completedAt: { gte: weekAgo } },
      _count: { _all: true },
    }),
  ]);

  const doneByPerson = new Map(doneLastWeek.map((row) => [row.assigneeId, row._count._all]));
  const overdueTasks = openTasks.filter((task) => isOverdue(task, now));
  const dueSoon = openTasks.filter(
    (task) => task.dueDate !== null && task.dueDate >= today && task.dueDate <= inThreeDays,
  );

  const workload: PersonWorkload[] = people.map((person) => {
    const mine = openTasks.filter((task) => task.assigneeId === person.id);
    return {
      id: person.id,
      name: person.name,
      pending: mine.filter((task) => task.status === "PENDENTE").length,
      inProgress: mine.filter((task) => task.status === "EM_ANDAMENTO").length,
      overdue: mine.filter((task) => isOverdue(task, now)).length,
      doneLastWeek: doneByPerson.get(person.id) ?? 0,
    };
  });

  return {
    totals: {
      open: openTasks.length,
      inProgress: openTasks.filter((task) => task.status === "EM_ANDAMENTO").length,
      overdue: overdueTasks.length,
      doneLastWeek: doneLastWeek.reduce((sum, row) => sum + row._count._all, 0),
    },
    workload,
    overdueTasks,
    dueSoon,
  };
}
