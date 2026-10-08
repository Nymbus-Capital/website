"use client";
/**
 * One fund as a card (home and /strategies): fund colour, asset class, vehicle, tagline, the published figures
 * (since-inception return rolling in, 1 year, YTD; on the strategies page also the NAV of the headline series
 * with its date) and, on the
 * strategies page, the last calendar years as small bars growing from the zero line. A figure that is not published
 * is not shown (a card without returns shows its NAV only, without any message). The card tilts slightly towards the pointer and a
 * light in the fund colour follows it (inert on touch and under reduced motion).
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Odometer, useInView, useTilt } from "@/components/motion/motion";
import { useTranslation, type L } from "@/lib/i18n";
import type { FundCard } from "./data";
import { FUND_COPY as F, RISK_COPY, VEHICLE_COPY } from "./home.copy";
import { dayText, miniBars, monthText, navText, pctText } from "./figures";
import { HL } from "./labels";

export const fundStyle = (f: Pick<FundCard, "color">) =>
  ({ "--fund": f.color.solid, "--fund-from": f.color.from, "--fund-to": f.color.to }) as CSSProperties;

const hasPerf = (f: FundCard) => f.si !== null || f.ytd !== null || f.y1 !== null;

function siLabel(f: FundCard): L {
  return f.siAnnualized ? F.si : F.siCum;
}

export function SampleTag() {
  const { pick } = useTranslation();
  return (
    <span className="fx-sample" title={pick(F.sampleLong)}>
      {pick(F.sample)}
    </span>
  );
}

const LEVELS = ["low", "low-medium", "medium", "medium-high", "high"] as const;
export function RiskScale({ risk }: { risk: FundCard["risk"] }) {
  const { pick } = useTranslation();
  const idx = LEVELS.indexOf(risk);
  return (
    <span className="fx-risk">
      <span className="fx-risk-bars" aria-hidden="true">
        {LEVELS.map((l, i) => (
          <i key={l} className={i <= idx ? "on" : ""} />
        ))}
      </span>
      <span>{pick(RISK_COPY[risk])}</span>
    </span>
  );
}

/** Last calendar years, bars growing up (or down) from the zero line when they scroll into view. */
function MiniBars({ f }: { f: FundCard }) {
  const { locale, pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.3 });
  if (!f.calendar.length) return null;
  const g = miniBars(f.calendar);
  const ytdWord = pick(F.ytd);
  // YTD only for the as-of year; an earlier partial year is the launch year
  const flag = (b: (typeof g.bars)[number]) =>
    b.kind === "ytd" ? ytdWord : b.kind === "launch" ? pick(HL.launchShort) : null;
  const flagLong = (b: (typeof g.bars)[number]) =>
    b.kind === "ytd" ? pick(F.ytdMark) : b.kind === "launch" ? pick(HL.sinceLaunch) : null;
  return (
    <figure className="fx-bars-w">
      <figcaption className="fx-lbl">{pick(F.calendar)}</figcaption>
      <div
        ref={ref}
        className="fx-bars"
        data-shown={seen ? "" : undefined}
        aria-hidden="true"
        style={{ ["--zero" as string]: g.zero }}
      >
        <span className="fx-bars-zero" />
        {g.bars.map((b, i) => (
          <span key={b.year} className={`fx-bar ${b.r < 0 ? "neg" : "pos"} ${b.partial ? "partial" : ""}`}>
            <i
              style={{
                top: `${b.top * 100}%`,
                height: `${Math.max(b.height * 100, 1.5)}%`,
                transitionDelay: `${i * 70}ms`,
              }}
            />
            <em style={{ top: b.r < 0 ? `calc(${(b.top + b.height) * 100}% + 3px)` : `calc(${b.top * 100}% - 17px)` }}>
              {pctText(b.r, locale, false)}
            </em>
          </span>
        ))}
      </div>
      <div className="fx-bars-x" aria-hidden="true">
        {g.bars.map((b) => (
          <span key={b.year}>{flag(b) ? `${b.year} ${flag(b)}` : b.year}</span>
        ))}
      </div>
      <ul className="sr-only">
        {g.bars.map((b) => (
          <li key={b.year}>
            {b.year}
            {flagLong(b) ? ` (${flagLong(b)})` : ""}
            {locale === "fr" ? "\u00a0: " : ": "}
            {pctText(b.r, locale, false)}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function FundTile({
  f,
  sample,
  index,
  variant = "home",
  headingLevel = 3,
}: {
  f: FundCard;
  sample: boolean;
  index: number;
  variant?: "home" | "full";
  headingLevel?: 2 | 3;
}) {
  const { locale, pick } = useTranslation();
  const tilt = useTilt<HTMLAnchorElement>(4);
  const H = headingLevel === 2 ? "h2" : "h3";
  // the home card's figure: since inception, else 1 year; without either the block is not rendered (never an empty slot)
  const perf = variant === "home" ? f.si !== null || f.y1 !== null : hasPerf(f);
  const basis = pick(f.basis === "gross" ? F.gross : F.net);
  // the daily NAV belongs to the strategies pages: the home cards carry the returns only
  const nav =
    f.nav && variant === "full" ? (
      <div className="fx-kv-i">
        <span className="fx-k">
          {pick(F.nav)} · {pick(F.navSeries)} {f.nav.display}
        </span>
        <span className="fx-v tabnum">{navText(f.nav.nav, f.nav.currency, locale)}</span>
        {f.nav.date ? (
          <span className="fx-d">
            {pick(F.navAsOf)} {dayText(f.nav.date, locale)}
          </span>
        ) : null}
      </div>
    ) : null;
  return (
    <Link
      ref={tilt}
      href={`/strategies/${f.key}`}
      className={`fx-card fx-${variant}`}
      style={fundStyle(f)}
      data-testid={`strategy-${f.key}`}
    >
      <span className="fx-light" aria-hidden="true" />
      <span className="fx-top">
        <span className="fx-no" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="fx-class">{pick(f.assetClass)}</span>
        <span className="fx-chips">
          {/* any sample figure on the card (returns or NAV) carries the tag */}
          {sample && (perf || nav) ? <SampleTag /> : null}
          <span className="fx-chip">{pick(f.vehicle === "fund" ? VEHICLE_COPY.fund : VEHICLE_COPY.strategy)}</span>
        </span>
      </span>
      <H className="fx-name">{pick(f.short)}</H>
      <span className="fx-tag">{pick(f.tagline)}</span>

      {perf ? (
        <span className="fx-figs" data-testid="fund-figure">
          {variant === "home" ? (
            <span className="fx-main">
              {f.si !== null || f.y1 !== null ? (
                <>
                  <span className="fig m g-fund">
                    <Odometer value={(f.si ?? f.y1)!} pct sign decimals={1} lang={locale} />
                  </span>
                  <span className="fx-lbl">
                    {pick(f.si !== null ? siLabel(f) : F.y1)} · {basis}
                  </span>
                  {f.perfVariant ? (
                    <span className="fx-lbl" data-testid="perf-variant-main">
                      {pick(f.perfVariant)}
                    </span>
                  ) : null}
                </>
              ) : null}
            </span>
          ) : null}
          <span className="fx-kv">
            {/* a figure that is not published is not shown (no dash, no placeholder) */}
            {variant === "full" && f.ytd !== null ? (
              <span className="fx-kv-i">
                <span className="fx-k">{pick(F.ytd)}</span>
                <span className="fx-v tabnum">{pctText(f.ytd, locale)}</span>
              </span>
            ) : null}
            {f.y1 !== null ? (
              <span className="fx-kv-i">
                <span className="fx-k">{pick(F.y1)}</span>
                <span className="fx-v tabnum">{pctText(f.y1, locale)}</span>
              </span>
            ) : null}
            {variant === "full" && f.si !== null ? (
              <span className="fx-kv-i">
                <span className="fx-k">{pick(siLabel(f))}</span>
                <span className="fx-v tabnum g-fund">{pctText(f.si, locale)}</span>
              </span>
            ) : null}
          </span>
          {variant === "full" && nav ? <span className="fx-kv fx-kv-nav">{nav}</span> : null}
          {f.asOf ? (
            <span className="fx-asof">
              {pick(F.asOf)} {monthText(f.asOf, locale)} · {basis}
              {/* the class of the returns shown (the NAV above is the same class when it has a NAV) */}
              {f.perfClass ? (
                <>
                  {" "}
                  ·{" "}
                  <span data-testid="perf-class">
                    {pick(F.perfClass)} {f.perfClass}
                  </span>
                </>
              ) : null}
              {f.perfVariant ? (
                <>
                  {" "}
                  · <span data-testid="perf-variant">{pick(f.perfVariant)}</span>
                </>
              ) : null}
            </span>
          ) : null}
        </span>
      ) : nav ? (
        <span className="fx-figs" data-testid="fund-nav-only">
          <span className="fx-kv">{nav}</span>
        </span>
      ) : null}

      {variant === "full" ? (
        <>
          {perf ? <MiniBars f={f} /> : null}
          <span className="fx-meta">
            <span className="fx-k">{pick(F.risk)}</span>
            <RiskScale risk={f.risk} />
          </span>
        </>
      ) : null}
      <span className="fx-go">
        {pick(F.view)} <ArrowRight aria-hidden="true" />
      </span>
    </Link>
  );
}
