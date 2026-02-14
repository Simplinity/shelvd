import { getUserFeedback } from '@/lib/actions/feedback'
import { SupportPageClient } from './support-client'
import { APP_VERSION } from '@/lib/changelog'

export const metadata = { title: 'Support' }

export default async function SupportPage() {
  const { data: submissions } = await getUserFeedback()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Report a bug or send us a message.
        </p>
      </div>

      <SupportPageClient 
        submissions={submissions || []} 
        appVersion={APP_VERSION}
      />
    </div>
  )
}
