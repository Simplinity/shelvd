import { getInviteCodes } from '@/lib/actions/invite-codes'
import { InviteCodesClient } from './invite-codes-client'

export default async function InviteCodesPage() {
  const { data: codes } = await getInviteCodes()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Invite Codes</h1>
      <InviteCodesClient initialCodes={codes} />
    </div>
  )
}
