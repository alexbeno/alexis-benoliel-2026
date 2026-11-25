import { DovetailGame } from "./_components/dovetail-game";
import { GeneralNotes } from "./_components/general-notes";
import { Hero } from "./_components/hero";
import { PartsList } from "./_components/parts-list";
import { Sheet } from "./_components/sheet";
import { SiteHeader } from "./_components/site-header";
import { TitleBlock } from "./_components/title-block";

export default function Home() {
  return (
    <Sheet>
      <SiteHeader />
      <main>
        <Hero />
        <section
          id="parts"
          className="grid grid-cols-12 border-b-[1.5px] border-ink"
        >
          <DovetailGame />
          <PartsList />
        </section>
        <section id="contact" className="grid grid-cols-12">
          <GeneralNotes />
          <TitleBlock />
        </section>
      </main>
    </Sheet>
  );
}
