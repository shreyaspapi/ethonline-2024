import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata = {
  title: 'Web3Auth NextJS Quick Start',
  description: 'Web3Auth NextJS Quick Start',
};

// eslint-disable-next-line no-undef
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
