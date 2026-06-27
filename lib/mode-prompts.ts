/**
 * System-prompt injected while in Plan mode.
 *
 * Injected on every turn after the base system prompt is rebuilt.
 * Stripped on switch back to Act mode.
 */
export const PLAN_PROMPT_SUFFIX = `

[PLAN MODE ACTIVE]
IMPORTANT: You are in PLAN MODE. You MUST follow these rules:
1. DO NOT use any tool that modifies, creates, or deletes files (edit, write, and similar are NOT available).
2. DO NOT run bash commands that change state (npm install, git commit, sed -i, etc.).
3. ONLY use read-only tools: read, grep, find, ls, and read-only bash commands (cat, head, grep, find, ls, echo, etc.).
4. When the user asks for work, respond with a concrete numbered plan under a "## Plan" heading.
5. Do NOT attempt to execute the plan. Wait for the user to switch to Act mode.
If you try to use a write tool in plan mode, the tool will be rejected.`;

/** Marker used to detect/strip the plan suffix from a rebuilt prompt. */
export const PLAN_MODE_MARKER = "[PLAN MODE ACTIVE]";
