import { useCallback, useState } from "react";

import type {
  DailyChallengeAnswerRequest,
  DailyChallengeResponse
} from "@coasterly/types";

import type { DailyChallengeStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseDailyChallengeOptions = {
  onAuthFailure: () => void;
};

export type UseDailyChallengeResult = {
  dailyChallengeStatus: DailyChallengeStatus;
  isSubmittingDailyChallenge: boolean;
  isClaimingDailyReward: boolean;
  loadDailyChallenge: (signal?: AbortSignal) => Promise<void>;
  submitDailyChallengeAnswer: (optionId: string) => Promise<void>;
  claimDailyReward: () => Promise<void>;
  resetDailyChallenge: () => void;
};

export const useDailyChallenge = ({
  onAuthFailure
}: UseDailyChallengeOptions): UseDailyChallengeResult => {
  const [dailyChallengeStatus, setDailyChallengeStatus] = useState<DailyChallengeStatus>({
    state: "idle"
  });
  const [isSubmittingDailyChallenge, setIsSubmittingDailyChallenge] = useState(false);
  const [isClaimingDailyReward, setIsClaimingDailyReward] = useState(false);

  const resetDailyChallenge = useCallback(() => {
    setDailyChallengeStatus({ state: "idle" });
  }, []);

  const loadDailyChallenge = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setDailyChallengeStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setDailyChallengeStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me/daily-challenge", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setDailyChallengeStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setDailyChallengeStatus({
          state: "error",
          message: `Daily challenge request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DailyChallengeResponse;

      setDailyChallengeStatus({
        state: "success",
        response: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setDailyChallengeStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The daily challenge request failed."
      });
    }
  }, []);

  const submitDailyChallengeAnswer = useCallback(
    async (optionId: string) => {
      if (!apiBaseUrl || dailyChallengeStatus.state !== "success") {
        return;
      }

      setIsSubmittingDailyChallenge(true);

      try {
        const response = await fetchWithSession(
          new URL("/me/daily-challenge/answer", apiBaseUrl),
          {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              optionId
            } satisfies DailyChallengeAnswerRequest)
          }
        );

        if (!response.ok) {
          if (response.status === authFailureStatusCode) {
            onAuthFailure();
            setDailyChallengeStatus({ state: "idle" });
            return;
          }

          setDailyChallengeStatus({
            state: "error",
            message: `Daily challenge answer failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as DailyChallengeResponse;

        setDailyChallengeStatus({
          state: "success",
          response: payload
        });
      } catch (error) {
        setDailyChallengeStatus({
          state: "error",
          message:
            error instanceof Error ? error.message : "The daily challenge answer failed."
        });
      } finally {
        setIsSubmittingDailyChallenge(false);
      }
    },
    [dailyChallengeStatus.state, onAuthFailure]
  );

  const claimDailyReward = useCallback(async () => {
    if (!apiBaseUrl || dailyChallengeStatus.state !== "success") {
      return;
    }

    setIsClaimingDailyReward(true);

    try {
      const response = await fetchWithSession(
        new URL("/me/daily-challenge/reward", apiBaseUrl),
        {
          method: "POST"
        }
      );

      if (!response.ok) {
        if (response.status === authFailureStatusCode) {
          onAuthFailure();
          setDailyChallengeStatus({ state: "idle" });
          return;
        }

        setDailyChallengeStatus({
          state: "error",
          message: `Daily reward claim failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DailyChallengeResponse;

      setDailyChallengeStatus({
        state: "success",
        response: payload
      });
    } catch (error) {
      setDailyChallengeStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The daily reward claim failed."
      });
    } finally {
      setIsClaimingDailyReward(false);
    }
  }, [dailyChallengeStatus.state, onAuthFailure]);

  return {
    dailyChallengeStatus,
    isSubmittingDailyChallenge,
    isClaimingDailyReward,
    loadDailyChallenge,
    submitDailyChallengeAnswer,
    claimDailyReward,
    resetDailyChallenge
  };
};
