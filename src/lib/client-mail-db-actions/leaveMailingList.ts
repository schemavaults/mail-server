export async function leaveMailingList(
  mailing_list_id: string,
  email: string,
): Promise<void> {
  await fetch(`/api/mailing-lists/unsubscribe`, {
    method: "POST",
    body: JSON.stringify({
      mailing_list_id,
      email,
    }),
  });
}

export default leaveMailingList;
