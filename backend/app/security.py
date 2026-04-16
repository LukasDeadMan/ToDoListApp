from collections import deque
from math import ceil
from time import monotonic


class LoginAttemptLimiter:
    """Track recent failed login attempts and block abusive bursts."""

    def __init__(
        self,
        *,
        max_attempts=5,
        window_seconds=300,
        block_seconds=300,
        clock=None,
    ):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.block_seconds = block_seconds
        self.clock = clock or monotonic
        self._entries = {}

    def _get_entry(self, key):
        return self._entries.setdefault(
            key,
            {
                "blocked_until": 0.0,
                "failures": deque(),
            },
        )

    def _prune(self, key, now):
        entry = self._entries.get(key)
        if entry is None:
            return None

        cutoff = now - self.window_seconds
        while entry["failures"] and entry["failures"][0] <= cutoff:
            entry["failures"].popleft()

        if entry["blocked_until"] <= now:
            entry["blocked_until"] = 0.0

        if entry["blocked_until"] == 0.0 and not entry["failures"]:
            self._entries.pop(key, None)
            return None

        return entry

    def get_retry_after(self, key):
        if not key:
            return 0

        now = self.clock()
        entry = self._prune(key, now)
        if entry is None or entry["blocked_until"] <= now:
            return 0

        return max(1, ceil(entry["blocked_until"] - now))

    def register_failure(self, key):
        if not key:
            return 0

        now = self.clock()
        entry = self._prune(key, now) or self._get_entry(key)
        entry["failures"].append(now)

        if len(entry["failures"]) >= self.max_attempts:
            entry["blocked_until"] = now + self.block_seconds
            return max(1, ceil(self.block_seconds))

        return 0

    def reset(self, key):
        if not key:
            return

        self._entries.pop(key, None)
