import { UserIndividualContent } from './_UserIndividualContent';

export default function UserPage({ params: { userId } }: { params: { userId: string } }) {
  return (
    <>
      <UserIndividualContent userId={userId} />
    </>
  );
}
