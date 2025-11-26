import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileCode, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { VerificationButton } from "@/components/ui/verification-button"; // Import the new component

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center">
      <main className="container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary mb-3">
            SEO Dynamic King
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A modern solution for dynamically generating essential SEO files in Next.js using App Router and Middleware.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<FileCode className="w-8 h-8 text-primary" />}
            title="Dynamic Sitemap.xml"
            description="Generates sitemap.xml on-the-fly from your site's routes. No more stale files. Click to see it live."
            link="/sitemap.xml"
            linkText="View /sitemap.xml"
          />
          <FeatureCard
            icon={<Bot className="w-8 h-8 text-primary" />}
            title="Dynamic Robots.txt"
            description="Serves a virtual robots.txt, keeping crawler instructions perfectly in sync with your deployment."
            link="/robots.txt"
            linkText="View /robots.txt"
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8 text-primary" />}
            title="Google Verification"
            description="Handles Google's site verification by serving the required HTML file from a dynamic route. Test with a sample below or automate the process."
            link="/google123abc.html"
            linkText="Test /google123abc.html"
          >
            {/* Add the verification button here */}
            <VerificationButton />
          </FeatureCard>
        </div>

        <footer className="text-center mt-20 text-muted-foreground">
          <p>Built with Next.js, ShadCN/UI, and Tailwind CSS.</p>
        </footer>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  children?: React.ReactNode; // Allow children to be passed
}

function FeatureCard({ icon, title, description, link, linkText, children }: FeatureCardProps) {
  return (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="bg-primary/10 p-4 rounded-lg">{icon}</div>
        <CardTitle className="text-xl font-headline text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow h-full">
        <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent hover:underline inline-flex items-center group mb-4"
        >
          {linkText}
          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
        {/* Render children below the link */}
        {children}
      </CardContent>
    </Card>
  );
}
