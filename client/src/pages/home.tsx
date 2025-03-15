import AdBanner from "@/components/home/ad-banner";
import Events from "@/components/home/events";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center gap-10">
      <AdBanner />
      <Events />
    </div>
  )
}
