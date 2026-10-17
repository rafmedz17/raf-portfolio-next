"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion, toggleTheme } from "@/lib/theme";
import { ACHIEVEMENTS, getUnlocked, unlock } from "@/lib/achievements";
import SnakeGame from "./SnakeGame";

const Muted = ({ children }) => <span className="text-muted">{children}</span>;
const Accent = ({ children }) => <span className="text-accent">{children}</span>;
const Link = ({ href, children }) => (
  <a href={href} target={href.startsWith("#") || href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" className="underline decoration-muted/40 underline-offset-4 hover:decoration-accent">
    {children}
  </a>
);

const HELP = [
  ["whoami", "who's behind this"],
  ["about", "a little more detail"],
  ["stack", "tools I work with"],
  ["projects", "selected work"],
  ["experience", "where I've worked"],
  ["contact", "how to reach me"],
  ["snake", "take a quick break"],
  ["achievements", "your progress on this site"],
  ["theme", "toggle light / dark"],
  ["reboot", "replay the intro"],
  ["clear", "clear the screen"],
];

const FORTUNES = [
  "It works on my machine. — every developer, ever",
  "There are 2 hard problems: cache invalidation, naming things, and off-by-one errors.",
  "Weeks of coding can save you hours of planning.",
  "The best code is no code at all.",
  "Deleted code is debugged code.",
  "First, solve the problem. Then, write the code.",
  "If it hurts, do it more often.",
];

function buildCommands({ profile, about, stack, projects, experience, socials }) {
  const COMMANDS = {
    help: () => (
      <div>
        <p>Available commands:</p>
        <div className="mt-1 grid grid-cols-[7.5rem_1fr] gap-x-2">
          {HELP.map(([cmd, desc]) => (
            <div key={cmd} className="contents">
              <Accent>{cmd}</Accent>
              <Muted>{desc}</Muted>
            </div>
          ))}
        </div>
        <p className="mt-2">
          <Muted>…and a few hidden ones. Have a look around.</Muted>
        </p>
      </div>
    ),
    whoami: () => (
      <p>
        {profile.fullName} — {profile.role.toLowerCase()}.{" "}
        <Muted>Writes code, reads docs, ships things.</Muted>
      </p>
    ),
    about: () => (
      <div className="space-y-2">
        {about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    ),
    stack: () => (
      <div className="grid grid-cols-[6.5rem_1fr] gap-x-2">
        {stack.map((s, i) => (
          <div key={i} className="contents">
            <Accent>{s.group}</Accent>
            <span>{s.items.join(", ")}</span>
          </div>
        ))}
      </div>
    ),
    projects: () => (
      <div>
        {projects.map((p, i) => (
          <p key={i}>
            <Muted>drwxr-xr-x {p.year}</Muted> <Accent>{p.title.toLowerCase().replace(/\s+/g, "-")}/</Accent>
          </p>
        ))}
        <p className="mt-1">
          <Muted>Details in the </Muted>
          <Link href="#work">work section</Link>
          <Muted>.</Muted>
        </p>
      </div>
    ),
    experience: () => (
      <div>
        {experience.map((e, i) => (
          <p key={i}>
            <Muted>{e.period.padEnd(16, " ")}</Muted> {e.role} <Muted>@ {e.company}</Muted>
          </p>
        ))}
      </div>
    ),
    contact: () => (
      <div>
        <p>
          <Accent>email</Accent> <Link href={`mailto:${profile.email}`}>{profile.email}</Link>
        </p>
        {socials.map((s, i) => (
          <p key={i}>
            <Accent>{s.label.toLowerCase()}</Accent> <Link href={s.href}>{s.href.replace(/^https?:\/\//, "")}</Link>
          </p>
        ))}
      </div>
    ),
    achievements: () => {
      const unlocked = getUnlocked();
      return (
        <div>
          <p>
            Unlocked <Accent>{unlocked.length}</Accent>/{ACHIEVEMENTS.length}
          </p>
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a.id);
            return (
              <p key={a.id}>
                {got ? <Accent>[✓]</Accent> : <Muted>[ ]</Muted>} {got ? a.title : <Muted>??? — {a.hint}</Muted>}
              </p>
            );
          })}
        </div>
      );
    },
    theme: () => {
      const next = toggleTheme();
      return <p>Switched to {next} mode.</p>;
    },
    date: () => <p>{new Date().toString()}</p>,
    fortune: () => <p>{FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}</p>,
    ls: () => <p><Accent>about.txt</Accent>  <Accent>projects/</Accent>  <Accent>experience.log</Accent>  <Muted>.secrets</Muted></p>,
    "ls -a": () => COMMANDS.ls(),
    "cat about.txt": () => COMMANDS.about(),
    "cat experience.log": () => COMMANDS.experience(),
    "cd projects": () => COMMANDS.projects(),
    "cat .secrets": () => <p>I actually enjoy writing documentation. Don&apos;t tell anyone. <Muted>(also: try the Konami code)</Muted></p>,
    "sudo hire raf": () => {
      unlock("sudo");
      return (
        <div>
          <p><Muted>[sudo] password for recruiter: ********</Muted></p>
          <p><Accent>✓ Access granted.</Accent> Great choice.</p>
          <p>Next step: <Link href={`mailto:${profile.email}?subject=Let's work together`}>{profile.email}</Link></p>
        </div>
      );
    },
    sudo: () => <p>Nice try. This incident will be reported. <Muted>(hint: sudo hire {profile.name.toLowerCase()})</Muted></p>,
    "rm -rf /": () => <p>Permission denied. This portfolio is load-bearing.</p>,
    "git push --force": () => <p>Whoa there. Not on main, friend.</p>,
    vim: () => <p>You are now trapped in vim. <Muted>Just kidding — type :q to pretend to leave.</Muted></p>,
    ":q": () => <p>Escaped vim. Few have done it.</p>,
    ping: () => <p>pong <Muted>— 0.4 ms, faster than my first API</Muted></p>,
    coffee: () => (
      <pre className="leading-tight">{`   ( (
      ) )
    ........
    |      |]
    \\      /
     \`----'   brewing… done.`}</pre>
    ),
    exit: () => <p>There is no exit. Only <Accent>contact</Accent>.</p>,
    reboot: () => {
      setTimeout(() => window.dispatchEvent(new Event("intro:replay")), 400);
      return <p><Muted>Rebooting… roll the opening credits.</Muted></p>;
    },
    hello: () => <p>Hey there 👋</p>,
  };
  COMMANDS.hi = COMMANDS.hello;
  COMMANDS.skills = COMMANDS.stack;
  COMMANDS.work = COMMANDS.projects;
  COMMANDS.dir = COMMANDS.ls;
  COMMANDS.intro = COMMANDS.reboot;
  return COMMANDS;
}

function Prompt({ user }) {
  return (
    <span className="shrink-0 select-none">
      <Accent>{user}</Accent>
      <Muted>:~$</Muted>{" "}
    </span>
  );
}

let lineId = 0;

export default function Terminal({ content }) {
  const commands = useMemo(() => buildCommands(content), [content]);
  const completions = [...Object.keys(commands), "snake", "clear"];
  const promptUser = `guest@${(content.profile.name || "guest").toLowerCase()}`;
  const [lines, setLines] = useState([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mode, setMode] = useState("shell");
  const introCancelled = useRef(false);
  const introDone = useRef(false);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const print = (...entries) =>
    setLines((prev) => [...prev, ...entries.map((e) => ({ id: ++lineId, ...e }))]);

  const run = (raw, { silent = false } = {}) => {
    const cmd = raw.trim().replace(/\s+/g, " ");
    if (cmd && !silent) unlock("hello");
    if (cmd === "clear") {
      setLines([]);
      return;
    }
    if (cmd === "snake") {
      print({ cmd: raw }, { output: <p><Muted>Starting snake… arrows / WASD / swipe to move, esc to quit.</Muted></p> });
      setMode("snake");
      return;
    }
    let output = null;
    if (cmd) {
      const handler = commands[cmd.toLowerCase()];
      if (handler) output = handler();
      else if (cmd.startsWith("echo ")) output = <p>{cmd.slice(5)}</p>;
      else if (cmd.startsWith("sudo ")) output = commands.sudo();
      else
        output = (
          <p>
            command not found: {cmd}. <Muted>Type </Muted>
            <Accent>help</Accent>
            <Muted>.</Muted>
          </p>
        );
    }
    print({ cmd: raw }, ...(output ? [{ output }] : []));
  };

  const exitSnake = (score) => {
    setMode("shell");
    print({
      output: (
        <p>
          Game over. Best score: <Accent>{score}</Accent>.{" "}
          <Muted>{score >= 10 ? "Impressive. Should I be worried about my job?" : score >= 5 ? "Not bad at all." : "Warm-up round, surely."}</Muted>
        </p>
      ),
    });
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  // Type out `whoami` on load, then hand over to the visitor.
  useEffect(() => {
    const target = "whoami";
    const timers = [];
    const finish = () => {
      if (introCancelled.current || introDone.current) return;
      introDone.current = true;
      setValue("");
      run(target, { silent: true });
      print({ output: <p><Muted>Type </Muted><Accent>help</Accent><Muted> to look around — or </Muted><Accent>snake</Accent><Muted> if you&apos;re bored.</Muted></p> });
    };
    const begin = () => {
      if (prefersReducedMotion()) {
        timers.push(setTimeout(finish, 0));
        return;
      }
      [...target].forEach((_, i) => {
        timers.push(setTimeout(() => !introCancelled.current && setValue(target.slice(0, i + 1)), 700 + i * 90));
      });
      timers.push(setTimeout(finish, 700 + target.length * 90 + 350));
    };
    // Wait for the cinematic intro (if it's playing) so the typing is seen.
    const introPlaying = document.documentElement.dataset.intro === "play";
    if (introPlaying) window.addEventListener("intro:done", begin, { once: true });
    else begin();

    const onPlay = () => {
      introCancelled.current = introDone.current = true;
      run("snake");
    };
    window.addEventListener("play-snake", onPlay);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("intro:done", begin);
      window.removeEventListener("play-snake", onPlay);
    };
    // Runs once on mount; `run` only touches state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  const cancelIntro = () => {
    if (!introCancelled.current && !introDone.current) {
      introCancelled.current = true;
      setValue("");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(value);
      if (value.trim()) setHistory((h) => [...h, value]);
      setHistoryIndex(-1);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const i = historyIndex + 1;
      if (i >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(i);
        setValue(history[i]);
      }
    } else if (e.key === "Tab") {
      const match = value && completions.find((c) => c.startsWith(value.toLowerCase()));
      if (match) {
        e.preventDefault();
        setValue(match);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)]"
      onClick={() => mode === "shell" && inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-muted/30" />
        <span className="size-2.5 rounded-full bg-muted/30" />
        <span className="size-2.5 rounded-full bg-muted/30" />
        <span className="ml-2 font-mono text-xs text-muted">
          {promptUser} — {mode === "snake" ? "snake (esc to quit)" : "zsh"}
        </span>
      </div>

      {mode === "snake" ? (
        <div className="h-80 p-2">
          <SnakeGame onExit={exitSnake} />
        </div>
      ) : (
        <div
          ref={bodyRef}
          className="terminal-scroll h-80 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
          aria-live="polite"
        >
          {lines.map((line) =>
            line.output ? (
              <div key={line.id} className="mb-2 break-words">
                {line.output}
              </div>
            ) : (
              <div key={line.id} className="flex">
                <Prompt user={promptUser} />
                <span className="break-all">{line.cmd}</span>
              </div>
            )
          )}

          <label className="group flex items-center">
            <Prompt user={promptUser} />
            <span className="sr-only">Terminal command</span>
            <span className="relative flex-1">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  cancelIntro();
                  setValue(e.target.value);
                }}
                onFocus={cancelIntro}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                className="w-full bg-transparent text-transparent caret-transparent outline-none"
              />
              <span className="pointer-events-none absolute inset-0 whitespace-pre" aria-hidden="true">
                {value}
                <span className="caret opacity-40 group-focus-within:opacity-100" />
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
