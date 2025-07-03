import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}