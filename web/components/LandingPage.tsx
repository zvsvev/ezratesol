import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Coins,
  KeyRound,
  Link2,
  LockKeyhole,
  MessageSquareText,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Star,
  TicketCheck,
  Trophy,
  WalletCards,
} from 'lucide-react'

const features = [
  {
    asset: '/icons/ezrate-icon-00.png',
    title: 'Attendee-only reviews',
    body: 'Organizers can gate reviews with event passcodes and Luma email whitelists for a cleaner signal.',
  },
  {
    asset: '/icons/ezrate-icon-02.png',
    title: 'Gasless reviewer UX',
    body: 'Reviewers sign with their Reown wallet while EZRATE relays the transaction using organizer-funded credits.',
  },
  {
    asset: '/icons/ezrate-icon-05.png',
    title: 'On-chain commitments',
    body: 'Ratings, reviewer identity hashes, and comment hashes are committed to Solana so results cannot be edited later.',
  },
  {
    asset: '/icons/ezrate-icon-04.png',
    title: 'Reward-ready events',
    body: 'Events can advertise random or pro-rata rewards in SOL, USDC, or vouchers as the payout layer matures.',
  },
]

const workflow = [
  ['01', 'Create event', 'Organizer sets name, review capacity, end time, passcode, and optional reward.'],
  ['02', 'Fund review credits', 'Organizer prepays SOL so attendees do not need to hold SOL just to leave a rating.'],
  ['03', 'Share passcode', 'After the event ends, attendees open the app and enter the event passcode.'],
  ['04', 'Commit review', 'The relayer submits the signed review and gets reimbursed from the prepaid event balance.'],
]

export function LandingPage() {
  return (
    <>
      <main className="landing">
        <nav className="nav" aria-label="Main navigation">
          <Link className="brand" href="/">
            <img src="/ezrate-logo.png" alt="" />
            EZRATE
          </Link>
          <div className="navlinks">
            <a className="button ghost" href="https://create.ezrate.fun">
              Create Event <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="https://app.ezrate.fun">
              User App <ArrowRight size={18} />
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
              on-chain review fees, and turn post-event feedback into a verifiable reputation graph.
            </p>
            <div className="heroActions">
              <a className="button secondary" href="https://app.ezrate.fun">
                Launch App <ArrowRight size={18} />
              </a>
              <a className="button ghost" href="https://create.ezrate.fun">
                Create Event <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="heroMockup" aria-hidden="true">
            <div className="reviewStream streamA">
              <span>4.9</span>
              <span>great speakers</span>
              <span>hash 9x2a...</span>
            </div>
            <div className="reviewStream streamB">
              <span>5.0</span>
              <span>verified attendee</span>
              <span>relay paid</span>
            </div>
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

      <section className="landingSection featureSection">
        <div className="sectionIntro">
          <p className="eyebrow">
            <RadioTower size={16} /> What EZRATE solves
          </p>
          <h2>Reviews that are harder to fake and easier to collect.</h2>
          <p>
            Web3 event feedback usually disappears into chats, private forms, or screenshots. EZRATE gives organizers a simple review flow while preserving public proof that a review was submitted.
          </p>
        </div>
        <div className="featureGrid">
          {features.map((feature) => (
            <article className="featureCard" key={feature.title}>
              <img className="assetIcon" src={feature.asset} alt="" />
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection workflowSection">
        <div className="sectionIntro narrow">
          <p className="eyebrow">
            <CalendarClock size={16} /> Event workflow
          </p>
          <h2>Built around how event organizers already run Web3 meetups.</h2>
        </div>
        <div className="workflowRail">
          {workflow.map(([step, title, body]) => (
            <article className="workflowCard" key={step}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="splitSection">
        <div className="splitCopy">
          <p className="eyebrow">
            <Coins size={16} /> Sponsored reviews
          </p>
          <h2>The attendee signs. The relayer pays. The organizer covers the relayer.</h2>
          <p>
            On Solana, a program cannot pay the network fee before execution. EZRATE uses a relayer architecture: the reviewer signs the review, the backend submits it, and the program reimburses the relayer from organizer prepaid SOL after the review is accepted.
          </p>
        </div>
        <div className="ledgerPanel" aria-hidden="true">
          <div className="ledgerLine active">
            <KeyRound size={18} />
            <span>Reviewer signs</span>
            <strong>0 SOL needed</strong>
          </div>
          <div className="ledgerLine">
            <RadioTower size={18} />
            <span>Relayer submits</span>
            <strong>fee payer</strong>
          </div>
          <div className="ledgerLine">
            <Coins size={18} />
            <span>Event reimburses</span>
            <strong>prepaid SOL</strong>
          </div>
        </div>
      </section>

      <section className="landingSection rewardSection">
        <div className="rewardPanel">
          <div>
            <p className="eyebrow">
              <Trophy size={16} /> Reward layer
            </p>
            <h2>Make feedback worth giving.</h2>
            <p>
              Organizers can configure reward intent in the MVP today. The next contract step is an on-chain reward vault for SOL, followed by USDC and voucher claims.
            </p>
          </div>
          <div className="rewardGrid">
            <div><img src="/icons/ezrate-icon-02.png" alt="" /><strong>SOL</strong><span>Best first payout asset</span></div>
            <div><img src="/icons/ezrate-icon-03.png" alt="" /><strong>USDC</strong><span>Stable rewards later</span></div>
            <div><img src="/icons/ezrate-icon-01.png" alt="" /><strong>Vouchers</strong><span>Claim codes in profile</span></div>
          </div>
        </div>
      </section>

      <section className="landingCta">
        <div>
          <p className="eyebrow">
            <LockKeyhole size={16} /> Split domains
          </p>
          <h2>One brand, two focused apps.</h2>
          <p>Use the attendee app for reviewing events, or the organizer console to create and fund review campaigns.</p>
        </div>
        <div className="ctaActions">
          <a className="button secondary" href="https://app.ezrate.fun">
            Launch App <MessageSquareText size={18} />
          </a>
          <a className="button ghost" href="https://create.ezrate.fun">
            Organizer Console <Link2 size={18} />
          </a>
        </div>
      </section>
    </>
  )
}
