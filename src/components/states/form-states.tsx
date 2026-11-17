"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { useRegion } from "@/components/region/region-context";
import type { FieldErrors } from "@/lib/validation";

/* -------------------------------------------------------------------------- */
/* Connection                                                                  */
/* -------------------------------------------------------------------------- */

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** Live `navigator.onLine`. Assumes online during SSR so markup matches. */
export function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

/** True once `active` has stayed true for `ms` (default 8 s): "this is taking longer than usual". */
export function useSlow(active: boolean, ms = 8000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setSlow(true), ms);
    return () => {
      clearTimeout(t);
      setSlow(false);
    };
  }, [active, ms]);
  return active && slow;
}

/* -------------------------------------------------------------------------- */
/* Submitting                                                                  */
/* -------------------------------------------------------------------------- */

export const SERVER_ERROR =
  "Something went wrong on our side and your request was not sent. Your details are still here. Try again, or reach us directly.";
export const NETWORK_ERROR =
  "We couldn't reach our server, so your request was not sent. Your details are still here. Check your connection and try again.";

type Result = { status: string; message: string; fieldErrors?: FieldErrors };

/**
 * Calls a server action from onSubmit instead of `<form action>`. React resets
 * a form after an action prop completes, which would wipe what the visitor
 * typed when the request fails; calling it ourselves keeps every field filled.
 * A thrown error (server down, connection dropped) becomes a normal error
 * state instead of reaching the error boundary.
 */
export function useSubmit<S extends Result>(action: (prev: S, fd: FormData) => Promise<S>, initial: S) {
  const [state, setState] = useState<S>(initial);
  const [pending, startTransition] = useTransition();
  const submit = useCallback(
    (fd: FormData) =>
      startTransition(async () => {
        try {
          const next = await action(initial, fd);
          if (next) setState(next);
        } catch (err) {
          // redirect() inside the action surfaces here; let Next handle it.
          if (String((err as { digest?: string })?.digest ?? "").startsWith("NEXT_REDIRECT")) throw err;
          setState({ ...initial, status: "error", message: navigator.onLine ? SERVER_ERROR : NETWORK_ERROR });
        }
      }),
    [action, initial],
  );
  return [state, submit, pending, setState] as const;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

/** The visible control for a field: by id first, then by name (skipping hidden inputs). */
function focusField(form: HTMLFormElement | null, name: string) {
  const el =
    form?.querySelector<HTMLElement>(`[id="${name}"]`) ??
    form?.querySelector<HTMLElement>(`[name="${name}"]:not([type="hidden"])`) ??
    document.getElementById(name);
  el?.focus();
}

const formValues = (form: HTMLFormElement) =>
  Object.fromEntries([...new FormData(form)].map(([k, val]) => [k, typeof val === "string" ? val : ""]));

/**
 * Inline validation: a field is checked when the visitor leaves it, and after
 * it has shown an error it re-checks as they type so the message clears the
 * moment it is fixed. Never nags on the first keystroke.
 */
export function useFieldErrors(validate: (values: Record<string, string>) => FieldErrors) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [summary, setSummary] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const fieldName = (el: EventTarget) => {
    const t = el as HTMLInputElement;
    return t.name || t.id;
  };

  const recheck = (form: HTMLFormElement, name: string) => {
    const msg = validate(formValues(form))[name];
    setErrors((prev) => {
      if (prev[name] === msg) return prev;
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  /** Run every rule; focus the first bad field. Returns true when valid. */
  const validateAll = (form: HTMLFormElement) => {
    formRef.current = form;
    const all = validate(formValues(form));
    setErrors(all);
    setSummary(true);
    const first = Object.keys(all)[0];
    if (first) requestAnimationFrame(() => focusField(form, first));
    return !first;
  };

  /** Server-side field errors come back through the same channel. */
  const showErrors = (e: FieldErrors | undefined) => {
    if (!e || !Object.keys(e).length) return;
    setErrors(e);
    setSummary(true);
    requestAnimationFrame(() => focusField(formRef.current, Object.keys(e)[0]));
  };

  const formProps = {
    noValidate: true,
    onBlur: (e: React.FocusEvent<HTMLFormElement>) => {
      const name = fieldName(e.target);
      // Focus moving into a popover (select list, phone country picker) is not "leaving" the field.
      const to = e.relatedTarget as Node | null;
      if (name && (!to || e.currentTarget.contains(to))) recheck(e.currentTarget, name);
    },
    onChange: (e: React.FormEvent<HTMLFormElement>) => {
      const name = fieldName(e.target);
      if (name && errors[name]) recheck(e.currentTarget, name);
    },
  };

  const a11y = (name: string, hintId?: string) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : hintId,
  });

  return { errors, setErrors, summary: summary && Object.keys(errors).length > 0, validateAll, showErrors, formProps, a11y, recheck };
}

/** Message directly under a field: icon + text, never colour alone. */
export function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${name}-error`} className="flex items-start gap-1.5 text-xs leading-snug text-crimson">
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

/** Short list at the top of the form, linking to each field that needs attention. */
export function ErrorSummary({ errors, labels }: { errors: FieldErrors; labels: Record<string, string> }) {
  const keys = Object.keys(errors);
  if (!keys.length) return null;
  return (
    <div role="alert" className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-charcoal">
      <p className="flex items-center gap-2 font-medium text-crimson">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        {keys.length === 1 ? "One field needs your attention" : `${keys.length} fields need your attention`}
      </p>
      <ul className="mt-2 space-y-1 pl-6">
        {keys.map((k) => (
          <li key={k}>
            <a
              href={`#${k}`}
              onClick={(e) => {
                e.preventDefault();
                focusField(e.currentTarget.closest("form"), k);
              }}
              className="text-navy underline underline-offset-2 hover:text-navy-soft"
            >
              {labels[k] ?? k}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Form-level message for problems that are not one field's fault. */
export function FormAlert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "info" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm leading-relaxed",
        tone === "error" ? "border-crimson/30 bg-crimson/5 text-charcoal" : "border-gold/40 bg-gold/10 text-navy",
      )}
    >
      {tone === "error" ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-crimson" aria-hidden />
      ) : (
        <WifiOff className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
      )}
      <div>{children}</div>
    </div>
  );
}

/** "+254 … or info@…" with working links. Virginia shows email only, as elsewhere on the site. */
export function ContactFallback({ prefix = "You can also reach us on" }: { prefix?: string }) {
  const { region } = useRegion();
  const email = (
    <a href={`mailto:${siteConfig.email}`} className="font-medium text-navy underline underline-offset-2">
      {siteConfig.email}
    </a>
  );
  return (
    <span>
      {prefix}{" "}
      {region !== "virginia" ? (
        <>
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="font-medium text-navy underline underline-offset-2"
          >
            {siteConfig.phone}
          </a>{" "}
          or {email}
        </>
      ) : (
        email
      )}
      .
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Success                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Replaces a form once it has gone through: confirm, reassure, say what
 * happens next. Focus moves to the heading so screen readers announce it.
 */
export function SuccessPanel({
  title,
  children,
  action,
  tone = "light",
}: {
  title: string;
  children?: React.ReactNode;
  action?: { label: string; href: string } | React.ReactNode;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const dark = tone === "dark";
  return (
    <div className="py-4 text-center" role="status">
      <CheckCircle2 className={cn("mx-auto size-10", dark ? "text-gold-soft" : "text-gold")} strokeWidth={1.5} aria-hidden />
      <h3
        ref={ref}
        tabIndex={-1}
        className={cn(
          "mt-4 font-display text-2xl leading-snug outline-none sm:text-3xl text-balance",
          dark ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h3>
      {children && (
        <div className={cn("mx-auto mt-3 max-w-md space-y-2 text-sm leading-relaxed", dark ? "text-white/75" : "text-charcoal/70")}>
          {children}
        </div>
      )}
      {action && (
        <div className="mt-6">
          {typeof action === "object" && action !== null && "href" in action && "label" in action ? (
            <Link href={action.href} className={cn("text-sm font-medium underline-offset-4 hover:underline", dark ? "text-gold-soft" : "text-navy")}>
              {action.label}
            </Link>
          ) : (
            (action as React.ReactNode)
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drafts and the offline outbox                                               */
/* -------------------------------------------------------------------------- */

const store = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private mode / quota: drafts are a convenience, never a blocker.
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

type Draft = { fields: Record<string, string>; extra?: unknown; at: number };

/**
 * Autosaves a form's text fields to this device: two seconds after typing
 * stops, and whenever a field loses focus. Passwords, card and hidden
 * fields are never saved. `extra` carries state that isn't a form field
 * (e.g. uploaded photo URLs).
 */
export function useDraft<E = unknown>(
  key: string,
  formRef: React.RefObject<HTMLFormElement | null>,
  opts: { fields?: string[]; getExtra?: () => E; onRestore?: (extra: E | undefined) => void; enabled?: boolean } = {},
) {
  const [restored, setRestored] = useState(false);
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });
  const enabled = opts.enabled !== false;

  const save = useCallback(() => {
    const form = formRef.current;
    if (!form || !enabled) return;
    const fields: Record<string, string> = {};
    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (!el.name || el.type === "password" || el.type === "hidden" || el.type === "file") continue;
      if (optsRef.current.fields && !optsRef.current.fields.includes(el.name)) continue;
      if (el.type === "checkbox") fields[el.name] = el.checked ? "on" : "";
      else if (el.value) fields[el.name] = el.value;
    }
    const extra = optsRef.current.getExtra?.();
    const empty = !Object.values(fields).some(Boolean) && (extra == null || (Array.isArray(extra) && !extra.length));
    if (empty) store.del(key);
    else store.set(key, { fields, extra, at: Date.now() } satisfies Draft);
  }, [formRef, key, enabled]);

  // Restore once on mount.
  useEffect(() => {
    const form = formRef.current;
    const draft = store.get<Draft>(key);
    if (!form || !draft || !enabled) return;
    let any = false;
    for (const [name, value] of Object.entries(draft.fields)) {
      const el = form.elements.namedItem(name) as HTMLInputElement | null;
      if (!el || !("value" in el)) continue;
      if (el.type === "checkbox") el.checked = value === "on";
      else if (el.value !== value) el.value = value;
      any = true;
    }
    if (draft.extra != null) {
      optsRef.current.onRestore?.(draft.extra as E);
      any = true;
    }
    setRestored(any);
  }, [formRef, key, enabled]);

  // Save on blur and shortly after typing.
  useEffect(() => {
    const form = formRef.current;
    if (!form || !enabled) return;
    let t: ReturnType<typeof setTimeout>;
    const soon = () => {
      clearTimeout(t);
      t = setTimeout(save, 2000);
    };
    form.addEventListener("input", soon);
    form.addEventListener("change", soon);
    form.addEventListener("focusout", save);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(t);
      form.removeEventListener("input", soon);
      form.removeEventListener("change", soon);
      form.removeEventListener("focusout", save);
      window.removeEventListener("pagehide", save);
    };
  }, [formRef, save, enabled]);

  const clear = useCallback(() => {
    store.del(key);
    setRestored(false);
  }, [key]);

  /** Throw the draft away and empty the form. */
  const discard = useCallback(() => {
    store.del(key);
    formRef.current?.reset();
    optsRef.current.onRestore?.(undefined);
    setRestored(false);
  }, [formRef, key]);

  return { restored, save, clear, discard };
}

/** "We restored your unsent draft." with a Discard link. */
export function DraftNotice({ onDiscard }: { onDiscard?: () => void }) {
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
      <span>We restored your unsent draft.</span>
      <button type="button" onClick={onDiscard} className="text-sm font-medium underline underline-offset-2 hover:text-navy-soft">
        Discard
      </button>
    </div>
  );
}

/**
 * Holds a submission made while offline and sends it when the connection
 * returns (on this page, or the next time the same form mounts).
 * `send` resolves true once the server has accepted it.
 */
export function useOutbox(key: string, send: (fields: Record<string, string>) => Promise<boolean>) {
  const online = useOnline();
  const [queued, setQueued] = useState(false);
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  const busy = useRef(false);

  useEffect(() => {
    const item = store.get<Record<string, string>>(key);
    // Syncing from localStorage (an external store) on mount and on reconnect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueued(Boolean(item));
    if (!item || !online || busy.current) return;
    busy.current = true;
    sendRef
      .current(item)
      .then((ok) => {
        if (ok) {
          store.del(key);
          setQueued(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        busy.current = false;
      });
  }, [key, online]);

  const enqueue = useCallback(
    (form: HTMLFormElement) => {
      store.set(key, formValues(form));
      setQueued(true);
    },
    [key],
  );

  return { queued, enqueue };
}
