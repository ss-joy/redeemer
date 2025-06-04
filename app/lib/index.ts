export function parseIntIdFromGraphQlId(gqlId: string): string {
  return (gqlId.split("/").pop() as string).toString();
}
