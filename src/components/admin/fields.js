"use client";

import { useId, useMemo, useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import Icon from "./Icon";
import { getIn } from "./schema";

const inputBase =
  "w-full rounded-lg border bg-bg px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent-soft";
const inputClass = (error) => `${inputBase} ${error ? "border-red-500/70" : "border-line hover:border-muted/40"}`;

// ── Single fields ─────────────────────────────────────────────

function Label({ htmlFor, field }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-[13px] font-medium">
      {field.label}
      {field.required && <span className="text-accent" title="Required">*</span>}
    </label>
  );
}

function Help({ field, error }) {
  if (error) {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
        <Icon name="alert" className="size-3.5" /> {error}
      </p>
    );
  }
  return field.help ? <p className="mt-1.5 text-xs text-muted">{field.help}</p> : null;
}

function Toggle({ id, field, value, onChange }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line px-3 py-2.5 transition hover:border-muted/40">
      <span className="text-sm">{field.label}</span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-5 w-9 rounded-full bg-muted/30 transition peer-checked:bg-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent-soft" />
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

function TagInput({ id, field, value = [], onChange, error }) {
  const [draft, setDraft] = useState("");

  const add = (raw) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    parts.forEach((p) => !next.includes(p) && next.push(p));
    onChange(next);
    setDraft("");
  };

  return (
    <div
      className={`${inputClass(error)} flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft`}
    >
      {value.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-surface py-0.5 pr-1 pl-2 font-mono text-xs">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="rounded p-0.5 text-muted hover:bg-bg hover:text-red-500"
            aria-label={`Remove ${tag}`}
          >
            <Icon name="x" className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (draft.trim()) add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? "Add more…" : field.placeholder}
        className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted/60"
      />
    </div>
  );
}

function TimezoneInput({ id, field, value, onChange, error }) {
  const listId = `${id}-zones`;
  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [];
    }
  }, []);
  return (
    <>
      <input id={id} list={listId} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={inputClass(error)} autoComplete="off" />
      <datalist id={listId}>
        {zones.map((z) => (
          <option key={z} value={z} />
        ))}
      </datalist>
    </>
  );
}

// Shrinks a photo in the browser (max 1200px, JPEG) so uploads stay small.
function resizeImage(file, maxSize = 1200) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}

function ImageField({ id, field, value, onChange, error }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please choose an image file (JPG, PNG or WebP)." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const dataUrl = await resizeImage(file);
      const result = await uploadImage(dataUrl);
      if (!result.ok) throw new Error(result.error);
      setLocalPreview(dataUrl);
      onChange(result.url);
      setMessage({
        type: "ok",
        text:
          result.mode === "github"
            ? "Uploaded to GitHub. Save, and it shows on the live site after the rebuild (1–2 min)."
            : "Uploaded! Hit Save to keep it.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const shown = localPreview && value?.startsWith("/uploads/") ? localPreview : value;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files?.[0]);
      }}
      className={`flex gap-4 rounded-lg border p-3 transition ${dragging ? "border-accent bg-accent-soft" : error ? "border-red-500/70" : "border-line"}`}
    >
      <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="size-full object-cover object-top" />
        ) : (
          <span className="grid size-full place-items-center text-muted">
            <Icon name="user" className="size-6" />
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-bg/70">
            <span className="size-5 animate-spin rounded-full border-2 border-muted/30 border-t-accent" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-8 items-center gap-1.5 rounded-md bg-fg px-3 text-xs font-medium text-bg transition hover:opacity-85 disabled:opacity-50"
          >
            <Icon name="upload" className="size-3.5" />
            {value ? "Upload new photo" : "Upload photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setLocalPreview(null);
                setMessage(null);
              }}
              className="flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-xs text-muted transition hover:text-red-500"
            >
              <Icon name="trash" className="size-3.5" /> Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted">or drag an image here. It&apos;s resized automatically.</p>
        {message && (
          <p className={`text-xs ${message.type === "error" ? "text-red-500" : "text-accent"}`}>{message.text}</p>
        )}
        <input
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full truncate bg-transparent font-mono text-[11px] text-muted outline-none focus:text-fg"
          aria-label="Image path or URL"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export function Field({ field, value, onChange, error }) {
  const id = useId();

  if (field.type === "toggle") return <Toggle id={id} field={field} value={value} onChange={onChange} />;

  let control;
  if (field.type === "textarea") {
    control = (
      <textarea
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={field.rows ?? 3}
        placeholder={field.placeholder}
        className={`${inputClass(error)} resize-y leading-relaxed [field-sizing:content]`}
      />
    );
  } else if (field.type === "tags") {
    control = <TagInput id={id} field={field} value={value} onChange={onChange} error={error} />;
  } else if (field.type === "image") {
    control = <ImageField id={id} field={field} value={value} onChange={onChange} error={error} />;
  } else if (field.type === "timezone") {
    control = <TimezoneInput id={id} field={field} value={value} onChange={onChange} error={error} />;
  } else {
    control = (
      <input
        id={id}
        type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={inputClass(error)}
        autoComplete="off"
        spellCheck={field.type !== "url" && field.type !== "email"}
      />
    );
  }

  return (
    <div>
      <Label htmlFor={id} field={field} />
      {control}
      <Help field={field} error={error} />
    </div>
  );
}

// ── Blocks ────────────────────────────────────────────────────

function BlockCard({ title, count, children }) {
  return (
    <section className="rounded-xl border border-line bg-bg">
      {title && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          {count != null && <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">{count}</span>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function FieldsBlock({ block, content, onChange, errors }) {
  return (
    <BlockCard title={block.title}>
      <div className="space-y-5">
        {block.fields
          .filter((f) => !f.showIf || f.showIf(content))
          .map((f) => (
            <Field key={f.path} field={f} value={getIn(content, f.path)} onChange={(v) => onChange(f.path, v)} error={errors[f.path]} />
          ))}
      </div>
    </BlockCard>
  );
}

function IconButton({ icon, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid size-7 place-items-center rounded-md text-muted transition hover:bg-surface disabled:pointer-events-none disabled:opacity-30 ${danger ? "hover:text-red-500" : "hover:text-fg"}`}
    >
      <Icon name={icon} className="size-3.5" />
    </button>
  );
}

function move(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function DeleteConfirm({ onConfirm, onCancel, itemName }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs">
      <span className="flex-1 text-red-500">Delete this {itemName}?</span>
      <button type="button" onClick={onCancel} className="rounded-md px-2 py-1 text-muted hover:text-fg">
        Cancel
      </button>
      <button type="button" onClick={onConfirm} className="rounded-md bg-red-500 px-2 py-1 font-medium text-white hover:bg-red-600">
        Delete
      </button>
    </div>
  );
}

export function ListBlock({ block, content, onChange, errors }) {
  const items = getIn(content, block.path) ?? [];
  const [open, setOpen] = useState(items.length === 1 ? 0 : null);
  const [confirming, setConfirming] = useState(null);
  const update = (next) => onChange(block.path, next);

  const hasError = (i) => Object.keys(errors).some((k) => k.startsWith(`${block.path}.${i}.`));

  return (
    <BlockCard title={block.title} count={items.length}>
      {items.length === 0 && (
        <div className="mb-3 rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          No {block.itemName}s yet. Add your first one below.
        </div>
      )}

      <ol className="space-y-2">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className={`rounded-lg border transition ${isOpen ? "border-muted/40 bg-surface/40" : "border-line"}`}>
              <div className="flex items-center gap-2 py-1.5 pr-1.5 pl-3">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left" aria-expanded={isOpen}>
                  <Icon name="chevron" className={`size-3.5 shrink-0 text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 truncate text-sm font-medium">
                      {block.itemTitle(item)}
                      {hasError(i) && <span className="size-1.5 shrink-0 rounded-full bg-red-500" title="Has a problem" />}
                    </span>
                    {block.itemSubtitle?.(item) && <span className="block truncate font-mono text-[11px] text-muted">{block.itemSubtitle(item)}</span>}
                  </span>
                </button>
                <IconButton icon="up" label="Move up" disabled={i === 0} onClick={() => { update(move(items, i, i - 1)); if (isOpen) setOpen(i - 1); }} />
                <IconButton icon="down" label="Move down" disabled={i === items.length - 1} onClick={() => { update(move(items, i, i + 1)); if (isOpen) setOpen(i + 1); }} />
                <IconButton icon="copy" label="Duplicate" onClick={() => { update([...items.slice(0, i + 1), structuredClone(item), ...items.slice(i + 1)]); setOpen(i + 1); }} />
                <IconButton icon="trash" label="Delete" danger onClick={() => setConfirming(i)} />
              </div>

              {confirming === i && (
                <div className="px-3 pb-3">
                  <DeleteConfirm
                    itemName={block.itemName}
                    onCancel={() => setConfirming(null)}
                    onConfirm={() => {
                      update(items.filter((_, j) => j !== i));
                      setConfirming(null);
                      setOpen(null);
                    }}
                  />
                </div>
              )}

              {isOpen && (
                <div className="space-y-4 border-t border-line px-4 py-4">
                  {block.fields.map((f) => (
                    <Field
                      key={f.key}
                      field={f}
                      value={item[f.key]}
                      onChange={(v) => update(items.map((it, j) => (j === i ? { ...it, [f.key]: v } : it)))}
                      error={errors[`${block.path}.${i}.${f.key}`]}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => {
          update([...items, structuredClone(block.newItem)]);
          setOpen(items.length);
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-2.5 text-sm text-muted transition hover:border-accent hover:bg-accent-soft hover:text-accent"
      >
        <Icon name="plus" className="size-4" /> Add {block.itemName}
      </button>
    </BlockCard>
  );
}

export function StringsBlock({ block, content, onChange }) {
  const items = getIn(content, block.path) ?? [];
  const update = (next) => onChange(block.path, next);

  return (
    <BlockCard title={block.title} count={items.length}>
      <ol className="space-y-3">
        {items.map((text, i) => (
          <li key={i} className="group flex gap-2">
            <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[11px] text-muted">{i + 1}</span>
            <textarea
              value={text}
              onChange={(e) => update(items.map((t, j) => (j === i ? e.target.value : t)))}
              rows={3}
              placeholder={block.placeholder}
              aria-label={`${block.itemName} ${i + 1}`}
              className={`${inputClass(false)} resize-y leading-relaxed [field-sizing:content]`}
            />
            <div className="flex flex-col">
              <IconButton icon="up" label="Move up" disabled={i === 0} onClick={() => update(move(items, i, i - 1))} />
              <IconButton icon="down" label="Move down" disabled={i === items.length - 1} onClick={() => update(move(items, i, i + 1))} />
              <IconButton icon="trash" label="Delete" danger onClick={() => update(items.filter((_, j) => j !== i))} />
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => update([...items, ""])}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-2.5 text-sm text-muted transition hover:border-accent hover:bg-accent-soft hover:text-accent"
      >
        <Icon name="plus" className="size-4" /> Add {block.itemName}
      </button>
    </BlockCard>
  );
}
