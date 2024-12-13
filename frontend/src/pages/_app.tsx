import { JetBrains_Mono, Open_Sans } from 'next/font/google';
import '../css/reset.scss';
import '../css/globals.scss';
import '../css/components.scss';
import { PostDataProvider } from '@/contexts/post-context';

const primaryFont = Open_Sans({ subsets: ['latin'], display: 'swap', variable: '--primary-font'});
const secondaryFont = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--accent-font'});

export default function App({ Component, pageProps }: { Component: any, pageProps: any}) {
  return (
    <PostDataProvider>
      <div className={`app ${primaryFont.variable} ${secondaryFont.variable}`}>
        <Component {...pageProps} />
      </div>
    </PostDataProvider>
  );
}
