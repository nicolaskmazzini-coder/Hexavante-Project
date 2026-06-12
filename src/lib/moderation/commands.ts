import {
  ALL_TERMINAL_COMMANDS,
  executeModerationCommand,
  type CommandResult,
} from "@/services/moderation-admin.service";

export { ALL_TERMINAL_COMMANDS, executeModerationCommand, type CommandResult };

export function autocompleteCommand(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "/help ";
  const match = ALL_TERMINAL_COMMANDS.find((c) => c.startsWith(trimmed));
  return match ? `${match} ` : null;
}
