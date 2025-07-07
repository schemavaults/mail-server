export async function joinMailingList(
  mailing_list_id: string,
  email: string,
): Promise<void> {
  await fetch("/api/mailing-lists/join", {
    method: "POST",
    body: JSON.stringify({
      mailing_list_id,
      email,
    }),
  });
}

export default joinMailingList;
