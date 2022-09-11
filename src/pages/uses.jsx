import Head from 'next/head'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function ToolsSection({ children, ...props }) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({ title, href, children }) {
  return (
    <Card as="li">
      <Card.Title className="font-display" as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

export default function Uses() {
  return (
    <>
      <Head>
        <title>Uses - Mathias Bøe</title>
        <meta
          name="description"
          content="Software I use, gadgets I love, and other things I recommend."
        />
      </Head>
      <SimpleLayout
        title="Software I use, gadgets I love, and other things I recommend."
        intro="I get asked a lot about the things I use to build software, stay productive, or buy to fool myself into thinking I’m being productive when I’m really just procrastinating. Here’s a big list of all of my favorite stuff."
      >
        <div className="space-y-20">
          <ToolsSection title="Workstation">
            <Tool title="16” MacBook Pro, M1 Pro, 32GB RAM (2021)">
              I have tried many different computers, my last computer was a
              Lenovo P1. A wonderful machine that was used to write my master
              thesis, used to solve issues in my part time job. And used to
              develop many of the projects seen on the projects page. Moving on
              to a new processor architecture however is a huge step up for
              overall comfort. I’ve never heard the fans turn on a single time,
              even under the incredibly heavy loads I have put it through. Maybe
              this will change in the future, if so, I'll update this post.
            </Tool>
            <Tool title="Moonlander Mk. II Keyboard">
              The moonlander is a great procastination tool and a great
              keyboard. Setting it up takes time, but the resulting layouts you
              get are tailored to your needs. It also make a huge difference in
              day to day use for my shoulders and wrists. That being said, it's
              expensive and slightly too loud for the office.
            </Tool>
            <Tool title="Apple Magic Trackpad">
              Something about all the gestures makes me feel like a wizard with
              special powers. I really like feeling like a wizard with special
              powers. It also makes my wrist hurt like a bitch, so maybe I am
              not man enough to wield these magical powers.
            </Tool>
            <Tool title="Logitech MX Master 3">
              Just the best productivity mouse out there, objectively, seen from
              my subjective viewpoint.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Development tools">
            <Tool title="VS Code">
              Visual studio code might not be the best at many things, everyone
              has their pet pieves. That being said, VS Code just handles
              everything good enough. Making it the most valuable tool I
              currently use in my daily frontend development.
            </Tool>
            <Tool title="kitty">
              I’m honestly not even sure what features I get with this that
              aren’t just part of the macOS Terminal but it’s what I use.
            </Tool>
            <Tool title="Emacs">
              With emacs you can do anything, it is by far the best LaTeX editor
              (in my opinion), also org-mode is an experience in and of itself.
              There are so many features and things you can add to make it do
              what you want it's amazing. That being said, this piece of
              software will probably eat up so much of your time that you should
              consider not trying it. If you know, you know.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Design">
            <Tool title="Figma">
              Although I feel like some features are missing still (It just got
              the feature of adding borders, or strokes), its a great tool for
              prototyping and designing wireframes and even more advanced
              designs.
            </Tool>
            <Tool title="Affinity Designer">
              I have many issues with affinity designer such as their shape
              builder being a lot harder to use compared to the same tool in
              Adobe Illustrator. That being said, affinity covers all the other
              aspects I've used in Illustrator at a cheaper price.
            </Tool>
            <Tool title="Affinity Photo">
              I must say that in this case I'd much rather use photoshop. I am
              able to reach the same result in both softwares, but I dont want
              to pay for the photoshop license as it currently is too expensive
              for the little time I spend editing pictures these days. Affinity
              photo covers all the basics, but I am considering pixelmator Pro
              instead for the future as I don't feel productive while using
              affinity.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Productivity">
            <Tool title="Obsidian">
              I am using obsidian for my notes, previously I used emacs for
              everything due to org-mode being amazing. But I kept finding emacs
              a time sink doing micro optimizations, so to keep productive I've
              moved notes to Obsidian instead, syncing my notes with github for
              backup.
            </Tool>
          </ToolsSection>
        </div>
      </SimpleLayout>
    </>
  )
}
