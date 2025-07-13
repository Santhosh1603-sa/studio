import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'NewsWise',
  description: 'An AI-powered news article categorization system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
        <footer className="py-4 mt-8 border-t">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                <p>A capstone project by Santhosh NR, Balaji K, Nithin Mani for the course ITA0615 - Machine Learning.</p>
            </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
