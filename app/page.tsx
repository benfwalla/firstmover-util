import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="space-y-6">
          <h1 className="text-xl font-medium text-center">open.firstmover.com is a place to make cool stuff for NYC apartment hunters.</h1>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-[#0171E5] mr-2">•</span>
              <a 
                href="https://firstmovernyc.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0171E5] hover:underline"
              >
                firstmovernyc.com
              </a>
            </li>
            <li className="flex items-start">
              <span className="text-[#0171E5] mr-2">•</span>
              <Link 
                href="/map" 
                className="text-[#0171E5] hover:underline"
              >
                Open House Map
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <footer className="py-4 sm:py-6">
        <a 
          href="https://firstmovernyc.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mx-auto flex items-center gap-1.5 w-fit px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
        >
          <span className="text-muted-foreground">by</span>
          <img 
            src="/logos/wide_transparent.svg" 
            alt="FirstMover" 
            className="h-3.5 sm:h-4 w-auto"
          />
        </a>
      </footer>
    </div>
  );
}
