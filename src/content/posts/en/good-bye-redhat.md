---
title: "Goodbye 👋 Red Hat"
excerpt: "The first company where I worked for over 10 years in my life, and probably the only one"
date: 2026-07-29
tags: ["Red Hat", "Layoffs", "Work"]
cover: "good-bye-redhat.jpg"
---

## An Urgent Meeting Invitation

On the morning of April 9, 2026, I just got up, turned on my computer, and browsed my emails as usual. An urgent meeting invitation appeared in my inbox, with the subject line **"Important business update"** – scheduled for 10:00–10:20 AM.

Having been at Red Hat for nearly 11 years, I had developed a keen sense for abnormal signals. 10 AM in the China time zone is never a regular slot for a global all-hands; and a truly important announcement would never label itself as "important" in the subject line, nor would it be so stingy as to only allow 20 minutes.

Those 20 minutes passed even faster than I expected. Red Hat's CTO took less than 10 minutes to calmly announce the news that had finally dropped: **the entire Engineering department in China was being cut.**

My team, my manager, and I – we all lost our jobs at that very moment.

## The April Fool's Prophecy

Actually, rumors had already been circulating in private chat groups as early as April 1. Some said they had heard that "Greater China Engineers would be wiped out."

That day was April Fools' Day. The date itself felt like a protective shield, making us more willing to treat it as a nasty joke rather than an impending verdict. The email we received eight days later, complete with personal severance package details, simply proved that this "joke" had been carefully planned and rehearsed long in advance.

In hindsight, we should have seen it coming. When IBM disbanded its China R&D division last year, we secretly felt relieved, even a little proud: "Red Hat is profitable. We're different."

But were we really any different?

## If Only Life Were as Sweet as First Sight

Let's turn the calendar back to 2015, when I first joined Red Hat. Everything felt fresh and exciting – I wanted to learn about all the people and all the processes. I still vividly remember a Principal Software Engineer giving a career-sharing session; everyone in the room was filled with aspirations for the future. He joked that although he had reached a relatively high level as an individual contributor, compared to his friends back home who were civil servants, his status didn't seem to measure up. Back then, there were probably fewer than 5 Principal Software Engineers in all of Red Hat China – now they are as common as weeds.

My first project at Red Hat was https://hardware.redhat.com – the Red Hat Hardware Certification Workflow system. It was a web application written in Perl, along with parsing the result packages from certification test suites. I had never even seen Perl before, let alone written anything in it.

I remember my very first task: I picked a small bug from Bugzilla and tried to fix it. As I got familiar with the entire workflow, I eventually wrote my own ORM in Perl to standardize and simplify the team's database operations. Another time, we received huge SOS result packages – after unpacking, the XML files inside were so massive that all existing parsing libraries would run out of memory. I wrote my own stream-based reader to extract the sections we needed in chunks.

From a complete newbie who knew almost nothing, I gradually became the core person on the team who solved all kinds of problems. I worked day and night with US colleagues, letting my efforts be seen, and earned my first trophy at Red Hat 🏆.

Later, some dramatic events happened within the team – office politics took their toll – and I eventually switched teams.

## Starting with Things I Didn't Know

In the new team, I once again found myself doing things I had never done before. I was put in charge of Infrastructure, and my first big task was to migrate all existing projects to OpenShift v3, which was based on Kubernetes.

Our IT team had set up a unique OpenShift configuration that differed from the official documentation in various ways. I had no one to turn to for help, so I just kept banging my head against it, constantly pestering the US-based IT colleagues. It took me about a year to really master OpenShift – it was that complex. But that period also gave me invaluable experience; later, whenever the platform had issues, I could almost instantly debug and fix them.

After that, I took on more of a "pioneer" role. For every new project or uncharted territory, I stood at the front, clearing the path. Once the groundwork was laid, I'd hand it over to other colleagues. Every day was about learning new things, hitting walls, finding solutions, standardizing them, and turning them into processes for others to follow.

I also took on the toughest problems. Two cases still stand out in my memory. One was building a shortest-path system that required the Dijkstra algorithm – I was far from an expert in algorithms, but I had to tackle it head-on. The system at the time either couldn't find the shortest path or would hang. I spent less than a week to resolve it.

The other was implementing a Gantt chart using Patternfly's Chart components. Patternfly didn't offer a ready-made component, so I had to roll my own – dealing with coordinates, tooltips, colors, and everything else. After countless hours poring over upstream documentation, I finally made it work. You can see the result today at https://access.redhat.com/product-life-cycles – click on "Product Timelines" – that's my work.

## What Now?

2026 has been a really tough year. I've sent out countless resumes, but have only gotten a handful of interview opportunities. Many times, I was automatically filtered out by AI screening systems due to my age and educational background.

Ironically, **AI is now doing exactly what I used to excel at** – quickly learning, providing solutions, and being that "go-to person." But nowadays, teams no longer need a human for that role.

I keep asking myself: do I really want to continue as a developer? If not, what else can I do?

I'm writing this blog post on the MacBook Pro that Red Hat issued to me for work. This is the last thing I'll do with it. Tomorrow I'll return it, and it will most likely be scrapped – even though it still performs well and is solid and reliable. Just like the Rongke office that Red Hat spent a fortune renovating last year – the money was spent, but the people are gone.

Work is really just a job. You shouldn't get too emotionally attached. You trade your time for money, and neither side owes the other anything.

Goodbye, Red Hat. 👋