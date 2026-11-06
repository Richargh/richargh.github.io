export const customCommands: Readonly<{
  sort: "--sort";
}>;
export type CustomCommand = typeof customCommands[keyof typeof customCommands];
