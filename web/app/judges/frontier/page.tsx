import { ArrowRight, BadgeCheck, Gift, KeyRound, Sparkles, TicketCheck } from 'lucide-react'
import Link from 'next/link'

export default function FrontierJudgesPage() {
  return (
    <main className="judgesPage">
      <section className="judgesHero">
        <div>
          <p className="eyebrow">
            <Sparkles size={16} /> Colosseum Frontier Judges
          </p>
          <h1>EZRATE Judge Pass</h1>
          <p>
            A private launch page for reviewing EZRATE with prefilled demo paths, organizer credits,
            and a fast way to test the gasless review loop.
          </p>
          <div className="judgeActions">
            <Link className="button secondary" href="/app">
              Open reviewer app <ArrowRight size={18} />
            </Link>
            <Link className="button ghost" href="/create">
              Open organizer portal <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="judgePass">
          <span>Private access</span>
          <strong>FRONTIER</strong>
          <p>Use demo passcode: <b>solananight52</b></p>
        </div>
      </section>

      <section className="judgeGrid">
        <article>
          <Gift size={24} />
          <h2>Gift</h2>
          <p>First 10 Frontier judges get a 10,000-credit organizer workspace for launch testing.</p>
        </article>
        <article>
          <TicketCheck size={24} />
          <h2>Demo</h2>
          <p>Review flow opens with passcode, email whitelist, rating, comment, and relay-ready status.</p>
        </article>
        <article>
          <BadgeCheck size={24} />
          <h2>Proof</h2>
          <p>Reviews are designed to commit rating and reviewer hashes to Solana with sponsored fees.</p>
        </article>
        <article>
          <KeyRound size={24} />
          <h2>Access</h2>
          <p>Email admin@ezrate.fun for a private organizer profile and reserved launch credits.</p>
        </article>
      </section>
    </main>
  )
}
