import { ArrowRight, BadgeCheck, ShieldCheck, TicketCheck } from 'lucide-react'

export function LandingPage() {
  return (
    <>
      <main className="landing">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="/">
            EZRATE
          </a>
          <div className="navlinks">
            <a className="button ghost" href="#proof">
              MVP
            </a>
            <a className="button secondary" href="/app">
              Open App <ArrowRight size={18} />
            </a>
          </div>
        </nav>

        <section className="hero">
          <div className="heroText">
            <p className="eyebrow">On-chain reviews for Web3 events</p>
            <h1>EZRATE</h1>
            <p>
              Collect honest event ratings from verified attendees, sponsor their Solana fees, and
              keep every review commitment tamper-resistant after submission.
            </p>
            <div className="heroActions">
              <a className="button secondary" href="/event/solana-builder-night">
                Try review flow <TicketCheck size={18} />
              </a>
              <a className="button ghost" href="/app">
                Organizer app <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <section className="proofStrip" id="proof">
        <div className="proofItem">
          <strong>
            <ShieldCheck size={24} /> Whitelisted
          </strong>
          <span>Luma email lists decide who can review during the MVP.</span>
        </div>
        <div className="proofItem">
          <strong>
            <BadgeCheck size={24} /> Immutable
          </strong>
          <span>Rating, reviewer hash, and comment hash are committed on Solana.</span>
        </div>
        <div className="proofItem">
          <strong>
            <TicketCheck size={24} /> Sponsored
          </strong>
          <span>Organizers fund review transactions so attendees do not need SOL.</span>
        </div>
      </section>
    </>
  )
}
