import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText = "",
  footerLinkText = "",
  footerLinkHref = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brass-sheen text-obsidian font-display font-800 text-sm">
            V
          </span>
          <span className="font-display text-lg font-700 text-ivory">VELOCIRA</span>
        </Link>

        <div className="rounded-panel border border-graphite-line bg-graphite p-8">
          <h1 className="font-display text-xl font-700 text-ivory">{title}</h1>
          <p className="mt-1.5 text-sm text-steel">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>

        {footerLinkHref && footerLinkText ? (
          <p className="mt-6 text-center text-sm text-steel">
            {footerText}{" "}
            <Link href={footerLinkHref} className="text-brass hover:underline">
              {footerLinkText}
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
