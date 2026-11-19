function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="A calm, sunlit landscape representing the journey to a stronger, more balanced self">
      <div className="visual-orbit visual-orbit-one" />
      <div className="visual-orbit visual-orbit-two" />
      <div className="visual-sun" />
      <div className="visual-horizon" />
      <svg className="visual-landscape" viewBox="0 0 700 560" role="img" aria-label="Rolling sage-green hills beneath a warm morning sun">
        <path className="landscape-back" d="M0 337c84-71 144-62 222-31 63 25 103-45 178-49 90-5 136 59 300-2v305H0V337Z" />
        <path className="landscape-mid" d="M0 396c91-54 162-48 240-11 60 28 111 13 170-26 82-55 172-26 290 24v177H0V396Z" />
        <path className="landscape-front" d="M0 475c92-35 178-60 270-33 86 25 142 44 222 4 72-36 131-8 208 32v82H0v-85Z" />
        <path className="landscape-path" d="M261 560c41-42 61-87 74-139 11-43 29-78 58-112M313 560c29-47 40-91 45-137" />
        <path className="landscape-path-highlight" d="M261 560c41-42 61-87 74-139 11-43 29-78 58-112" />
        <path className="hill-detail" d="M24 448c60-39 124-50 183-34M443 402c63-33 130-28 204-2" />
        <path className="plant-stem" d="M542 407c0-30-3-54-16-77m16 77c5-33 16-52 35-68m-35 68c-14-23-28-34-49-39" />
        <path className="plant-leaf" d="M526 331c-16 0-25-10-25-25 16 0 25 10 25 25Zm31 8c0-16 10-25 25-25 0 16-10 25-25 25Zm-39 12c-15-6-20-19-14-34 15 6 20 19 14 34Z" />
        <circle className="landscape-dot" cx="105" cy="324" r="3" />
        <circle className="landscape-dot" cx="128" cy="309" r="2" />
      </svg>
      <div className="visual-label"><span className="label-spark" aria-hidden="true">✳</span> YOUR JOURNEY, YOUR PACE</div>
      <div className="visual-note">
        <div className="note-check" aria-hidden="true">✓</div>
        <div><strong>Showing up for yourself</strong><span>is already progress.</span></div>
      </div>
      <div className="visual-tag">A LITTLE BETTER, EVERY DAY</div>
    </div>
  )
}

export default HeroVisual
