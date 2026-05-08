import type { SubscriptionPlan, SubscriptionState } from '../state/store'

export type SubscriptionProvider = {
  get: () => Promise<SubscriptionState>
  activate: (plan: SubscriptionPlan) => Promise<SubscriptionState>
}

export class MockSubscriptionProvider implements SubscriptionProvider {
  private getState: () => SubscriptionState
  private setState: (s: SubscriptionState) => void

  constructor(opts: { getState: () => SubscriptionState; setState: (s: SubscriptionState) => void }) {
    this.getState = opts.getState
    this.setState = opts.setState
  }

  async get() {
    return this.getState()
  }

  async activate(plan: SubscriptionPlan) {
    const next: SubscriptionState = {
      ...this.getState(),
      plan,
      status: 'active',
      selectedAt: Date.now(),
    }
    this.setState(next)
    return next
  }
}

// TODO: SupabaseSubscriptionProvider
// - store subscription in Supabase (per user/org)
// - verify status from backend (expired/active)
// - keep mock activation for dev/demo

