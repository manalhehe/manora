import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import HeroVisual from '../components/HeroVisual'
import './LandingPage.css'

const features = [
  {
    number: '01',
    title: 'Nutrition',
    description: 'Build healthier eating habits that feel good and fit real life.',
    icon: (
      <>
        <path d="M12 21c-4.1-2.6-6.3-5.8-6.3-9.2A6.3 6.3 0 0 1 12 5.5a6.3 6.3 0 0 1 6.3 6.3c0 3.4-2.2 6.6-6.3 9.2Z" />
        <path d="M12 5.5c0-1.6.9-3 2.5-4M12 19v-8" />
      </>
    ),
  },
  {
    number: '02',
    title: 'Fitness',
    description: 'Find movement you enjoy and grow stronger at your own pace.',
    icon: (
      <>
        <path d="M6.5 9v6M3.5 10.5v3M17.5 9v6M20.5 10.5v3M6.5 12h11" />
      </>
    ),
  },
  {
    number: '03',
    title: 'Self-care',
    description: 'Make room for the small rituals that help you feel your best.',
    icon: (
      <>
        <path d="M12 20.2S4 15.7 4 9.8a4.2 4.2 0 0 1 8-1.8 4.2 4.2 0 0 1 8 1.8c0 5.9-8 10.4-8 10.4Z" />
      </>
    ),
  },
  {
    number: '04',
    title: 'Discipline',
    description: 'Turn small daily promises into steady, lasting consistency.',
    icon: (
      <>
        <path d="M12 3.5 19 6v5.2c0 4.5-2.9 7.7-7 9.3-4.1-1.6-7-4.8-7-9.3V6l7-2.5Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    number: '05',
    title: 'Mindset',
    description: 'Build self-belief, discover what matters, and keep growing.',
    icon: (
      <>
        <path d="M9.5 18h5M10 21h4M8.2 14.5a6 6 0 1 1 7.6 0c-.8.6-1.3 1.5-1.3 2.5h-5c0-1-.5-1.9-1.3-2.5Z" />
        <path d="M12 2v1.5M4.9 4.9 6 6M2 12h1.5M22 12h-1.5M19.1 4.9 18 6" />
      </>
    ),
  },
  {
    number: '06',
    title: 'AI Assistant',
    description: 'Personalized wellness guidance, thoughtfully on your terms.',
    badge: 'On the way',
    icon: (
      <>
        <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </>
    ),
  },
]

const steps = [
  {
    number: '01',
    title: 'Discover yourself',
    description: 'Understand your current lifestyle, what matters to you, and where you want to go.',
  },
  {
    number: '02',
    title: 'Build your plan',
    description: 'Shape a personal approach around your goals, your routines, and your real life.',
  },
  {
    number: '03',
    title: 'Track your growth',
    description: 'Notice your progress, celebrate showing up, and keep moving forward.',
  },
]

function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-inner page-width">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> A more intentional you</span>
              <h1 id="hero-title">Your new self <span>starts here.</span></h1>
              <p className="hero-description">
                Build better habits, strengthen your discipline, and become the person you&apos;ve always wanted to be.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="/register">
                  Start your journey <span aria-hidden="true">↗</span>
                </a>
                <a className="button button-text" href="#about">
                  Discover MANORA <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="hero-note">
                <span className="avatar-stack" aria-hidden="true">
                  <span>M</span><span>✳</span><span>+</span>
                </span>
                <p><strong>A journey, not a quick fix.</strong><br />Progress that meets you where you are.</p>
              </div>
            </div>
            <HeroVisual />
          </div>
          <div className="hero-bottom page-width" aria-label="Our philosophy">
            <span>YOUR GOALS</span><span className="hero-bottom-mark">✳</span>
            <span>YOUR DISCIPLINE</span><span className="hero-bottom-mark">✳</span>
            <span>YOUR TRANSFORMATION</span>
          </div>
        </section>

        <section className="about-section section-pad" id="about" aria-labelledby="about-title">
          <div className="about-inner page-width">
            <div className="about-marker">
              <span className="section-index">01 / OUR APPROACH</span>
              <span className="about-stem" aria-hidden="true" />
            </div>
            <div className="about-content">
              <p className="eyebrow">Meet MANORA</p>
              <h2 id="about-title">A better you, built <em>one day at a time.</em></h2>
              <div className="about-bottom">
                <p>
                  MANORA is a personal transformation platform for the whole of you: how you move, eat, think, and show up for yourself.
                </p>
                <p>
                  Because meaningful change doesn&apos;t come from unrealistic promises. It comes from small, consistent actions—and a little more self-belief, every day.
                </p>
              </div>
            </div>
            <div className="about-seal" aria-label="Your goals. Your pace. Your progress.">
              <span className="seal-orbit seal-orbit-one" />
              <span className="seal-orbit seal-orbit-two" />
              <span className="seal-center">M</span>
              <span className="seal-caption">GROW AT YOUR OWN PACE</span>
            </div>
          </div>
        </section>

        <section className="features-section section-pad" id="features" aria-labelledby="features-title">
          <div className="page-width">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Everything works together</p>
                <h2 id="features-title">Your whole self.<br /><em>One thoughtful plan.</em></h2>
              </div>
              <p className="section-intro">
                No all-or-nothing thinking. Just the foundations for feeling stronger, steadier, and more like you.
              </p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-card-top">
                    <span className="feature-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {feature.icon}
                      </svg>
                    </span>
                    <span className="feature-number">{feature.number}</span>
                  </div>
                  <div className="feature-card-copy">
                    <h3>{feature.title}</h3>
                    {feature.badge && <span className="feature-badge">{feature.badge}</span>}
                    <p>{feature.description}</p>
                  </div>
                  <span className="feature-arrow" aria-hidden="true">↗</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="journey-section section-pad" id="journey" aria-labelledby="journey-title">
          <div className="page-width">
            <div className="journey-heading">
              <p className="eyebrow">A path that feels like yours</p>
              <h2 id="journey-title">Small steps. <em>Real change.</em></h2>
              <p>There&apos;s no perfect place to begin. Just the next step that feels right for you.</p>
            </div>
            <ol className="journey-steps">
              {steps.map((step) => (
                <li className="journey-step" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <span className="step-line" aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
            <div className="journey-callout">
              <span className="callout-spark" aria-hidden="true">✳</span>
              <p><strong>Remember:</strong> consistency over perfection. Every step forward counts.</p>
              <a href="#final-cta" aria-label="Continue to your next chapter">Keep going <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>

        <section className="final-cta-section" id="final-cta" aria-labelledby="cta-title">
          <div className="final-cta page-width">
            <div className="cta-flower" aria-hidden="true">✳</div>
            <p className="eyebrow">This is your moment</p>
            <h2 id="cta-title">Your next chapter starts <em>with one decision.</em></h2>
            <a className="button button-light" href="/register">
              Start your transformation <span aria-hidden="true">↗</span>
            </a>
            <p className="cta-footnote">No pressure to be perfect. Just a place to begin.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

export default LandingPage
