import { useState } from "react";

export interface WaitlistLabels {
  label: string;
  placeholder: string;
  cta: string;
  sending: string;
  hint: string;
  success: string;
  error: string;
  invalid: string;
}

interface Props {
  labels: WaitlistLabels;
  locale: string;
  endpoint?: string;
  id: string;
  align?: "left" | "center";
  tone?: "day" | "night";
}

type Status = "idle" | "sending" | "success" | "error" | "invalid";

export default function WaitlistForm({
  labels,
  locale,
  endpoint,
  id,
  align = "center",
  tone = "day",
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      if (!endpoint) throw new Error("waitlist endpoint not configured");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) throw new Error(`waitlist signup failed: ${res.status}`);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p
        className="w-[min(28rem,100%)] p-4 text-center text-lead font-medium"
        role="status"
      >
        {labels.success}
      </p>
    );
  }

  const inputId = `${id}-email`;
  const showError = status === "error" || status === "invalid";
  const msgAlign =
    align === "left"
      ? "text-center min-[940px]:text-left min-[940px]:pl-4"
      : "text-center";
  const hintColor = tone === "night" ? "text-night-subtle" : "text-day-subtle";
  const errorColor =
    tone === "night"
      ? "text-[oklch(0.78_0.13_20)]"
      : "text-[oklch(0.5_0.19_25)]";

  return (
    <form
      className="w-[min(28rem,100%)]"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      <div className="flex gap-2 rounded-full bg-day-surface p-2 shadow-[0_1px_2px_oklch(0.28_0.022_20/0.06),0_6px_18px_-6px_oklch(0.35_0.06_20/0.18),0_20px_45px_-18px_oklch(0.4_0.09_25/0.22)] focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-day-accent max-[480px]:flex-col max-[480px]:rounded-[1.4rem]">
        <label className="sr-only" htmlFor={inputId}>
          {labels.label}
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder={labels.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (showError) setStatus("idle");
          }}
          aria-invalid={status === "invalid" || undefined}
          aria-describedby={showError ? `${inputId}-msg` : undefined}
          disabled={status === "sending"}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-day-ink outline-none placeholder:text-day-subtle"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="cursor-pointer rounded-full bg-day-accent px-6 py-3 font-semibold whitespace-nowrap text-[oklch(0.99_0.005_17)] transition-[transform,background-color] duration-150 ease-out-quint hover:scale-[1.03] hover:bg-day-accent-hover active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 max-[480px]:py-4"
        >
          {status === "sending" ? labels.sending : labels.cta}
        </button>
      </div>
      <p
        className={`mt-3 text-sm ${msgAlign} ${showError ? `font-medium ${errorColor}` : hintColor}`}
        id={`${inputId}-msg`}
        role={showError ? "alert" : undefined}
      >
        {status === "invalid"
          ? labels.invalid
          : status === "error"
            ? labels.error
            : labels.hint}
      </p>
    </form>
  );
}
