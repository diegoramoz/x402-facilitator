---
name: name-it
description: Generate easy-to-pronounce names for products, companies, brands, tools, projects, or objects through a conversational and divergent process. Use when user asks for naming help or mentions naming, name this, help me name, brand name, or company name.
license: MIT
metadata:
  author: Diego Ramos
  version: '1.0.0'
---

Interview the user for the purpose of generating a novel name for one thing. To find this novel name, you must search for existing words in the world's languages that capture the essence of what they're naming.

Ask questions one at a time to uncover what the thing is, the feeling the name should evoke, whether it should be abstract/brandable or descriptive, and any constraints such as amount of syllables, special characters, numbers, or non-english pronunciation preference.

Once enough context is acquired, conduct a linguistic search to identify esoteric words and unconventional ways to express the desired intent. You may use foreign languages and word combinations or modifications to come up with novel options. This search should prioritize finding actual words (not just roots) that capture the semantic essence of what they're naming.

Then run parallel subagents (no more than 4) to explore the linguistic directions. Each subagent focuses on one direction and returns up to 3 premium candidates that are easy to pronounce in the user's preferred language (default English) and comply with user constraints.

Return the resulting candidates with Name, Pronunciation, Origin, and Feeling so the user can compare not only sound but intent.

Then ask for directional feedback. In later rounds, include prior names and feedback in full context to prevent repetition and encourage more divergent options.
