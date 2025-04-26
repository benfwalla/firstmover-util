// Next.js imports
import Link from "next/link";
import { Home as HomeIcon, MapPin, Calendar, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">FirstMover</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/map" className="text-primary hover:underline flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Open House Map
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 bg-background">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Find Open Houses in <span className="text-primary">New York City</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our interactive map helps you discover upcoming open houses across NYC. Get real-time notifications before anyone else with FirstMover.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              href="/map" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 px-6 py-4 bg-primary text-primary-foreground shadow hover:bg-primary/90"
            >
              <MapPin className="mr-2 h-5 w-5" /> View Open Houses
            </Link>
            <a
              href="https://firstmovernyc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 px-6 py-4 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="mr-2 h-5 w-5" /> Visit FirstMover Website
            </a>
          </div>
        </div>

        <div className="mt-20 border rounded-lg overflow-hidden shadow-md max-w-4xl w-full bg-card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">About This Tool</h2>
          </div>
          <div className="p-6 space-y-4">
            <p>
              This interactive map is designed to be embedded in the FirstMover marketing site, providing users with a seamless experience for discovering open houses in New York City.
            </p>
            <p>
              With FirstMover, you&apos;ll get StreetEasy notifications before anyone else, giving you a competitive edge in the NYC real estate market.
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
              <Calendar className="h-4 w-4" />
              <span>Updated with new open house listings regularly</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 bg-muted">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FirstMover. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
