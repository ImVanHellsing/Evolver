import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { WorkoutTemplate, WorkoutSession } from '@/models/Workout';
import { workoutSessionsRepository } from '@/services/workouts/workoutSessionsRepository';
import { DAY_OF_WEEK_ORDER } from '@/models/DayOfWeek';

type UseWorkoutsArgs = {
  routineTemplateId: string;
  workouts: WorkoutTemplate[];
};

export type WorkoutWithLastSession = {
  workout: WorkoutTemplate;
  lastSession: WorkoutSession | null;
  hasAnySession: boolean;
};

export const useWorkouts = ({ routineTemplateId, workouts }: UseWorkoutsArgs) => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    setIsLoading(true);
    const list = await workoutSessionsRepository.listByRoutine(routineTemplateId);
    setSessions(list ?? []);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routineTemplateId])
  );

  const workoutsWithLastSession: WorkoutWithLastSession[] = useMemo(() => {
    const sortedWorkouts = workouts
      .slice()
      .sort((a, b) => DAY_OF_WEEK_ORDER[a.dayOfWeek] - DAY_OF_WEEK_ORDER[b.dayOfWeek]);

    return sortedWorkouts.map((w) => {
      const related = sessions.filter((s) => s.workoutTemplateId === w.id);

      if (related.length === 0) {
        return {
          workout: w,
          lastSession: null,
          hasAnySession: false,
        };
      }

      const last = related
        .slice()
        .sort((a, b) =>
          String(b.date).localeCompare(String(a.date))
        )[0];

      return {
        workout: w,
        lastSession: last,
        hasAnySession: true,
      };
    });
  }, [workouts, sessions]);

  const routineHasAnySession = useMemo(() => {
    return sessions.length > 0;
  }, [sessions]);

  return {
    isLoading,
    reload,
    routineHasAnySession,
    workoutsWithLastSession,
  };
};