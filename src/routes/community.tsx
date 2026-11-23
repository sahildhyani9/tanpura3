import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/Section";
import { FinalCTA } from "@/components/site/CTA";
import baithakImg from "@/assets/tanpura/baithak-gallery-2.png";
import gallery1 from "@/assets/tanpura/baithak-gallery-1.jpg";
import gallery2 from "@/assets/tanpura/baithak-gallery-2.png";
import gallery3 from "@/assets/tanpura/baithak-gallery-3.png";
import aparajitaPoster from "@/assets/tanpura/aparajita-baithak.png";
import { academyStats } from "@/data/tanpura";
import { Check } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Baithaks & Community — Tanpura House" },
      {
        name: "description",
        content:
          "Explore Tanpura House Baithaks, intimate live-music gatherings, event posters, performance photographs and the 2025 Aparajita Chakraborty Baithak.",
      },
      { property: "og:title", content: "Baithaks & Community — Tanpura House" },
      {
        property: "og:description",
        content:
          "An archive of Tanpura House Baithaks and intimate live-music gatherings in Dehradun.",
      },
      { property: "og:url", content: "/community" },
      { property: "og:image", content: baithakImg },
    ],
    links: [{ rel: "canonical", href: "/community" }],
  }),
  validateSearch: (search: Record<string, unknown>): { event?: typeof aparajita.id } =>
    search.event === aparajita.id ? { event: aparajita.id } : {},
  component: CommunityPage,
});

function CommunityPage() {
  const { event } = Route.useSearch();
  return (
    <>
      <PageHero
        eyebrow="Baithaks & Community"
        title="Live music, shared at close range."
        intro="An intimate gathering where artists come together to share the pure joy of live music and heartfelt performance."
      />

      <section className="section-y">
        <div className="container-x grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <img
            src={baithakImg}
            alt="Audience gathered for a Tanpura House Baithak"
            loading="lazy"
            width={1400}
            height={900}
            className="aspect-[3/2] w-full rounded-sm object-cover shadow-soft"
          />
          <div>
            <p className="eyebrow mb-3">Sangat</p>
            <h2 className="font-serif text-3xl text-indigo-deep md:text-4xl">
              Baithaks are part of the musical environment.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              They create a space for listening, performance, artistic exchange and community around
              Hindustani Classical Music. Tanpura House has organised eight Baithaks alongside
              workshops, student learning and performances.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-5 border-t border-border pt-6">
              {academyStats
                .filter((s) =>
                  ["Workshops organised", "Performances", "Baithaks organised"].includes(s.label),
                )
                .map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-serif text-3xl text-indigo-deep">{stat.value}</dt>
                    <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </section>

      <ArchiveGrid event={event} />

      <FinalCTA />
    </>
  );
}

const archiveYears = ["2026", "2025", "2024"] as const;
const aparajita = {
  id: "aparajita-chakraborty",
  year: "2025",
  title: "Aparajita Chakraborty",
  type: "Rabindra Sangeet",
  poster: aparajitaPoster,
  photos: [gallery1, gallery2, gallery3],
} as const;

function ArchiveGrid({ event }: { event?: typeof aparajita.id }) {
  const [year, setYear] = useState<string>("all");
  if (event === aparajita.id) {
    return (
      <>
        <div className="container-x pt-8">
          <Link to="/community" search={{}} className="text-sm underline">
            ? Back to the Baithak archive
          </Link>
        </div>
        <AparajitaDetails />
      </>
    );
  }

  return (
    <Section eyebrow="Baithak Archive" title="Explore Baithaks by year.">
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter Baithaks by year">
        {["all", ...archiveYears].map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={filter === year}
            onClick={() => setYear(filter)}
            className="rounded-sm border border-border px-4 py-2 text-sm text-indigo-deep hover:border-gold aria-pressed:bg-indigo-deep aria-pressed:text-white"
          >
            {filter === "all" ? "All years" : filter}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(year === "all" || year === aparajita.year) && (
          <Link
            to="/community"
            search={{ event: aparajita.id }}
            className="group overflow-hidden rounded-sm border border-border bg-card hover:border-gold"
          >
            <div className="bg-secondary/40 p-4">
              <img
                src={aparajita.poster}
                alt=""
                loading="lazy"
                className="h-60 w-full object-contain"
              />
            </div>
            <div className="p-5">
              <p className="eyebrow">
                {aparajita.year} ? {aparajita.type}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-indigo-deep">{aparajita.title}</h3>
              <p className="mt-4 text-sm text-indigo-deep group-hover:underline">View Baithak ?</p>
            </div>
          </Link>
        )}
      </div>
      {year !== aparajita.year && <UnconfirmedPoster year={year} />}
    </Section>
  );
}

function UnconfirmedPoster({ year }: { year: string }) {
  return (
    <aside className="mt-6 rounded-sm border border-dashed border-border p-5 text-sm text-muted-foreground">
      <p className="font-medium text-indigo-deep">
        {year === "all" ? "2024 and 2026 archive material" : year + " archive material"}
      </p>
      <p className="mt-2">
        The original archive shows the same poster under both years. Its year needs confirmation.
      </p>
    </aside>
  );
}

function AparajitaDetails() {
  return (
    <>
      <Section eyebrow="2025 Baithak" title={aparajita.title}>
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <img
              src={aparajitaPoster}
              alt="Aparajita Chakraborty Baithak Season 2 poster"
              className="w-full rounded-sm border border-border object-cover shadow-soft"
            />
            <div className="mt-5 rounded-sm border border-border bg-secondary/40 p-5 text-sm">
              <p>
                <span className="eyebrow mr-2">Year</span> 2025
              </p>
              <p className="mt-2">
                <span className="eyebrow mr-2">Type</span> Rabindra Sangeet
              </p>
            </div>
          </div>
          <div className="md:col-span-8">
            <p className="eyebrow">Performer</p>
            <h3 className="mt-2 font-serif text-3xl text-indigo-deep">
              Dhrupad Vocalist — 21st Generation Dagarvani Tradition
            </h3>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Aparajita began her musical journey at the age of six, born into a family rich in
              music and theatre. She holds a Master’s degree in Music from Rabindra Bharati
              University, Kolkata, where she deeply immersed herself in Dhrupad. She considers
              Dhrupad her spiritual rebirth, a path that helped her discover her true self through
              sound and silence. As a practitioner of the Dagarvani tradition, she belongs to its
              21st generation.
            </p>

            <h4 className="mt-8 font-serif text-2xl text-indigo-deep">Core training</h4>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Dhrupad under Ustad Faiyaz Wasifuddin Dagar",
                "Advanced guidance from Padma Shri Gundecha Brothers",
                "Khayal with Rajyashree Ghosh & Sushobhon Chanda",
                "Rabindra Sangeet with Debarati Shom & Piyali Mukherjee",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-sm border border-border bg-card p-4 text-sm leading-relaxed"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h4 className="mt-8 font-serif text-2xl text-indigo-deep">Notable performances</h4>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/85">
              {[
                "NCPA, Mumbai (2021)",
                "Chennai Dhrupad Utsav (2019)",
                "Smaran Gurukul, Bhopal (2019)",
                "Multiple concerts in Goa (2019)",
                "Several online concerts (2020–2022)",
                "Rabindra Sangeet programmes at Jorasanko Thakurbari and other venues in Kolkata",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="Baithak Gallery" title="Photographs preserved from the 2025 event page.">
        <div className="grid gap-6 md:grid-cols-3">
          {aparajita.photos.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Tanpura House Baithak photograph ${index + 1}`}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm border border-border object-cover shadow-soft"
            />
          ))}
        </div>
      </Section>
    </>
  );
}
