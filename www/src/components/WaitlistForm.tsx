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
}

type Status = "idle" | "sending" | "success" | "error" | "invalid";

export default function WaitlistForm({ labels, locale, endpoint, id }: Props) {
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
      <p className="wl-success" role="status">
        {labels.success}
      </p>
    );
  }

  const inputId = `${id}-email`;
  const showError = status === "error" || status === "invalid";

  return (
    <form
      className="wl"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      <div className="wl-bar">
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
        />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? labels.sending : labels.cta}
        </button>
      </div>
      <p
        className={showError ? "wl-msg wl-msg-error" : "wl-msg"}
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
