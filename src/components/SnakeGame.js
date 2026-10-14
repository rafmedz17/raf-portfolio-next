"use client";

import { useEffect, useRef } from "react";
import { cssVar } from "@/lib/theme";
import { unlock } from "@/lib/achievements";

const CELL = 14;
const DIRS = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};

export default function SnakeGame({ onExit }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cols = Math.floor(wrap.clientWidth / CELL);
    const rows = Math.floor(wrap.clientHeight / CELL);
    canvas.width = cols * CELL * dpr;
    canvas.height = rows * CELL * dpr;
    canvas.style.width = `${cols * CELL}px`;
    canvas.style.height = `${rows * CELL}px`;
    ctx.scale(dpr, dpr);

    const colors = { accent: cssVar("--accent"), food: cssVar("--hash"), muted: cssVar("--muted"), line: cssVar("--line") };
    const mono = `${cssVar("--font-geist-mono")}, monospace`;
    let state;
    let best = 0;
    let timer;

    const randomFood = (snake) => {
      let food;
      do {
        food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      } while (snake.some((p) => p.x === food.x && p.y === food.y));
      return food;
    };

    const reset = () => {
      const start = { x: Math.floor(cols / 3), y: Math.floor(rows / 2) };
      const snake = [start, { x: start.x - 1, y: start.y }, { x: start.x - 2, y: start.y }];
      state = { snake, dir: [1, 0], queue: [], food: randomFood(snake), score: 0, over: false, speed: 110 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, cols * CELL, rows * CELL);
      ctx.strokeStyle = colors.line;
      ctx.strokeRect(0.5, 0.5, cols * CELL - 1, rows * CELL - 1);

      ctx.fillStyle = colors.food;
      ctx.beginPath();
      ctx.arc(state.food.x * CELL + CELL / 2, state.food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
      ctx.fill();

      state.snake.forEach((p, i) => {
        ctx.globalAlpha = Math.max(0.35, 1 - i / (state.snake.length + 4));
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.roundRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2, 3);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      ctx.font = `12px ${mono}`;
      ctx.fillStyle = colors.muted;
      ctx.textAlign = "right";
      ctx.fillText(`score ${state.score}  best ${best}`, cols * CELL - 8, 16);

      if (state.over) {
        ctx.textAlign = "center";
        ctx.fillStyle = colors.accent;
        ctx.font = `600 14px ${mono}`;
        ctx.fillText("segmentation fault (core dumped)", (cols * CELL) / 2, (rows * CELL) / 2 - 8);
        ctx.fillStyle = colors.muted;
        ctx.font = `12px ${mono}`;
        ctx.fillText("space / tap to retry · esc to quit", (cols * CELL) / 2, (rows * CELL) / 2 + 14);
      }
    };

    const step = () => {
      if (state.over) return;
      if (state.queue.length) state.dir = state.queue.shift();
      const head = state.snake[0];
      const next = { x: head.x + state.dir[0], y: head.y + state.dir[1] };
      const hitWall = next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows;
      const hitSelf = state.snake.some((p) => p.x === next.x && p.y === next.y);
      if (hitWall || hitSelf) {
        state.over = true;
        best = Math.max(best, state.score);
        draw();
        return;
      }
      state.snake.unshift(next);
      if (next.x === state.food.x && next.y === state.food.y) {
        state.score++;
        if (state.score >= 5) unlock("snake");
        state.food = randomFood(state.snake);
        state.speed = Math.max(55, state.speed - 4);
      } else {
        state.snake.pop();
      }
      draw();
      timer = setTimeout(step, state.speed);
    };

    const start = () => {
      clearTimeout(timer);
      reset();
      draw();
      timer = setTimeout(step, 400);
    };

    const turn = (dir) => {
      const last = state.queue.at(-1) ?? state.dir;
      if (dir[0] === -last[0] && dir[1] === -last[1]) return; // no reversing
      if (dir[0] === last[0] && dir[1] === last[1]) return;
      if (state.queue.length < 3) state.queue.push(dir);
    };

    const exit = () => {
      clearTimeout(timer);
      onExitRef.current(Math.max(best, state.score));
    };

    const onKey = (e) => {
      const dir = DIRS[e.key] ?? DIRS[e.key.toLowerCase()];
      if (dir) {
        e.preventDefault();
        turn(dir);
      } else if (e.key === "Escape" || e.key === "q") {
        e.preventDefault();
        exit();
      } else if (e.key === " " && state.over) {
        e.preventDefault();
        start();
      }
    };

    let touch = null;
    const onTouchStart = (e) => {
      touch = e.touches[0];
    };
    const onTouchEnd = (e) => {
      if (!touch) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touch.clientX;
      const dy = t.clientY - touch.clientY;
      touch = null;
      if (state.over) return start();
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    };

    wrap.addEventListener("keydown", onKey);
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchend", onTouchEnd);
    wrap.focus({ preventScroll: true });
    start();

    return () => {
      clearTimeout(timer);
      wrap.removeEventListener("keydown", onKey);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className="grid h-full w-full touch-none place-items-center outline-none"
      aria-label="Snake game. Use arrow keys or WASD to move, Escape to quit."
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
