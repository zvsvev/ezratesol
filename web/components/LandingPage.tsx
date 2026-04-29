import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Star, TicketCheck, WalletCards } from 'lucide-react'

export function LandingPage() {
  return (
    <>
      <main className="landing">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="/">
            <span>EZ</span>RATE
          </a>
          <div className="navlinks">
            <a className="button secondary" href="/app">
              Launch App <ArrowRight size={18} />
            </a>
          </div>
        </nav>

        <section className="hero">
          <div className="heroText">
            <p className="eyebrow">
              <Sparkles size={16} /> Solana devnet MVP
            </p>
            <h1>EZRATE</h1>
            <p>
              A mobile-first review layer for Web3 events. Whitelist real attendees, sponsor their
              review fees, and commit every rating to Solana.
            </p>
            <div className="heroActions">
              <a className="button secondary" href="/app">
                Launch App <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="heroMockup" aria-hidden="true">
            <div className="mockTop">
              <span>EZRATE</span>
              <div className="mockPill">devnet</div>
            </div>
            <div className="mockScore">
              <span>Solana Builder Night</span>
              <strong>4.8</strong>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill="currentColor" />
                ))}
              </div>
            </div>
            <div className="mockRows">
              <div><span>Whitelisted</span><strong>120</strong></div>
              <div><span>Submitted</span><strong>36</strong></div>
              <div><span>Relay credits</span><strong>84</strong></div>
            </div>
            <div className="mockCommit">
              <BadgeCheck size={18} />
              review hash committed
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
        <div className="proofItem">
          <strong>
            <WalletCards size={24} /> Reown Login
          </strong>
          <span>Google/social wallet onboarding is ready for your Reown project.</span>
        </div>
      </section>
    </>
  )
}
