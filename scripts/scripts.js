document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);

  const out = $("#output");
  const msg = $("#msg");
  const widthInput = $("#width");
  const thinkInput = $("#think");
  // If you added a spots checkbox earlier, this will work; otherwise undefined is fine.
  const spotsInput = $("#spots");

  // Guard: if key elements are missing, explain why.
  if (!out || !msg || !widthInput) {
    console.error("Cowsay init failed: missing one of #output, #msg, #width (check your HTML IDs).");
    return;
  }

  // Tiny fortunes so something shows instantly
 const FORTUNES = [
  "Simplicity is a feature.",
  "Weeks of coding can save hours of planning.",
  "Absence of evidence is not evidence of absence.",
  "You are the debugger you’ve been waiting for.",
  "Premature optimization is the root of all evil… but shipping nothing is the root of most evil.",
  "Never attribute to malice what can be explained by a missing semicolon.",
  "Work in public; learn in private.",
  "Your future self is watching—leave them good comments.",
  "If it’s not in version control, it doesn’t exist.",
  "Measure twice, `rm -rf` never.",
  "Small steps, quick feedback.",
  "The map is not the territory; the dashboard is not the data.",
  "Latency is a feature your users never asked for.",
  "Strong opinions, loosely coupled.",
  "Conventions are just reusable decisions.",
  "Every TODO is a time capsule.",
  "Refactor when it hurts, not when it itches.",
  "The first draft is supposed to be ugly. Ship the second.",
  "A failing test is a flashlight, not a failure.",
  "Scope creep: the slow jam of missed deadlines.",
  "Caching: where you store your mistakes for later.",
  "99 little bugs in the code; take one down, patch it around, 127 little bugs in the code.",
  "If it compiles on the first try, you forgot to save.",
  "Documentation is user interface for developers.",
  "If you can’t monitor it, you can’t trust it.",
  "Automation doesn’t fix chaos; it repeats it faster.",
  "Your backlog is a museum of unmade decisions.",
  "The best feature is the one you delete.",
  "Most meetings can be a README.",
  "The cloud is just someone else’s computer with better marketing.",
  "Use comments to explain why, not what.",
  "Complex is not the same as sophisticated.",
  "Your defaults are a product decision.",
  "Progress over perfection, because perfection never ships.",
  "Edge cases are just users with hobbies.",
  "An elegant API forgives clumsy users.",
  "Security is a process, not a product.",
  "Latency hides in the places you felt clever.",
  "Your laptop is not production. Production is production.",
  "When in doubt, make a tiny prototype.",
  "Naming things is hard; renaming things is harder.",
  "The best time to write tests was before; the second best time is now.",
  "You don’t need a microservice; you need a nap.",
  "Feature flags: because commitment is scary.",
  "Do not store secrets in plain text, future archaeologists will judge you.",
  "If everything is important, nothing is prioritized.",
  "Find the constraint; feed the constraint.",
  "A good error message is a miniature tutorial.",
  "Logs are letters to your future self at 3 a.m.",
  "Make it easy to do the right thing.",
  "APIs are contracts. Read the fine print.",
  "The database is honest; your code is optimistic.",
  "Latency grows in the gaps between teams.",
  "Backup before bravery.",
  "A clean diff is a kind diff.",
  "Test like a pessimist, design like an optimist.",
  "Moving fast with guardrails beats moving perfectly with guard towers.",
  "If it’s hard to explain, it’s trying to be two things.",
  "You don’t need more tools; you need fewer exceptions.",
  "A good default beats a thousand settings.",
  "The best abstraction is the one you can teach in one paragraph.",
  "If it requires a ritual, automate the ritual.",
  "Time zones are a prank played by history.",
  "Latency is the tax on distance; pay it with caches wisely.",
  "The only unreviewed code that ages well is poetry, and even that gets edited.",
  "Try boring tech before inventing spicy tech.",
  "Every incident is an unpaid internship with reality.",
  "If you can’t delete it, you don’t own it.",
  "Benchmarks don’t lie; benchmarkers might.",
  "Uptime is a love language.",
  "Monoliths aren’t bad; tangled monoliths are.",
  "Make illegal states unrepresentable.",
  "The CLI is a UI with manners.",
  "Cleverness is a debt with high interest.",
  "Latency is contagious; isolate it.",
  "A failing build is a gift—open it.",
  "Your future users will be on a train with spotty Wi-Fi.",
  "If it needs a wizard, maybe it needs a simpler idea.",
  "Cost is a feature. So is dignity.",
  "Be the rubber duck you want to see in the world.",
  "Trunk-based development: fewer branches, fewer naps on merge day.",
  "The best metric is the one that changes your behavior.",
  "Don’t confuse motion for progress; `git log` is not a roadmap.",
  "Constraints are creativity’s scaffolding.",
  "Latency is to UX what sand is to gears.",
  "Make the invisible visible, then make it better.",
  "Every prod issue starts as an unread warning.",
  "Tools don’t adopt culture; people do.",
  "Delete code with ceremony.",
  "It’s not magic; it’s turtles and tradeoffs all the way down.",
  "Stay curious; the universe is weirder than your error messages."
];


  const randomFortune = () => FORTUNES[Math.floor(Math.random() * FORTUNES.length)];

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function wrap(text, width) {
    const words = text.replace(/\s+/g, " ").split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      if (w.length > width) {
        if (line) { lines.push(line); line = ""; }
        for (let i = 0; i < w.length; i += width) lines.push(w.slice(i, i + width));
      } else if ((line + " " + w).trim().length <= width) {
        line = (line ? line + " " : "") + w;
      } else {
        lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  function padRight(s, len) { return s + " ".repeat(len - s.length); }

  function buildBubble(lines) {
    const maxLen = Math.max(...lines.map(s => s.length), 0);
    const top = " " + "_".repeat(maxLen + 2);
    const bottom = " " + "-".repeat(maxLen + 2);

    if (lines.length === 1) {
      const s = padRight(lines[0], maxLen);
      return `${top}\n< ${s} >\n${bottom}`;
    }
    const middle = lines.map((s, i) => {
      const padded = padRight(s, maxLen);
      if (i === 0) return `/ ${padded} \\`;
      if (i === lines.length - 1) return `\\ ${padded} /`;
      return `| ${padded} |`;
    }).join("\n");
    return `${top}\n${middle}\n${bottom}`;
  }

  // Spot-ready cow; preserves leading spaces (no .trim())
  function buildCow(thinking, spotted = false) {
    const eyes = thinking ? "oo" : "oo"; // keep two chars for alignment
    if (!spotted) {
      return [
        "        \\   ^__^",
        `         \\  (${eyes})\\_______`,
        "            (__)\\       )\\/\\",
        "                ||----w |",
        "                ||     ||"
      ].join("\n");
    }
    // Holstein patches without shifting width
    return [
      "        \\   ^__^",
      `         \\  (${eyes})\\_______`,
      "            (__)\\  (  ) )\\/\\",
      "                ||-(  )|",
      "                ||     ||"
    ].join("\n");
  }

  function render() {
    const w = clamp(parseInt(widthInput.value, 10) || 40, 10, 80);
    widthInput.value = String(w);
    const text = (msg.value || "").trim() || randomFortune();
    const lines = wrap(text, w);
    const bubble = buildBubble(lines);
    const cow = buildCow(!!thinkInput?.checked, !!spotsInput?.checked);
    out.textContent = bubble + "\n" + cow;
  }

  // Wire buttons if present
  const btnSay = $("#btnSay");
  const btnFortune = $("#btnFortune");
  const btnCopy = $("#btnCopy");

  btnSay?.addEventListener("click", render);
  btnFortune?.addEventListener("click", () => { msg.value = randomFortune(); render(); });
  btnCopy?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(out.textContent || "");
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  });

  // Initial message + render
  if (!msg.value) msg.value = randomFortune();
  render();
});
