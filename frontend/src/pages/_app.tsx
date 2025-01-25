import { JetBrains_Mono, Open_Sans } from 'next/font/google';
import '../css/reset.scss';
import '../css/globals.scss';
import '../css/components.scss';
import { PostDataProvider } from '@/contexts/post-context';
import { UserDataProvider } from '@/contexts/user-context';
import dynamic from 'next/dynamic';

const primaryFont = Open_Sans({ subsets: ['latin'], display: 'swap', variable: '--primary-font' });
const secondaryFont = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--accent-font' });

export function App({ Component, pageProps }: { Component: any, pageProps: any }) {
  return (
    <UserDataProvider>
      <PostDataProvider>
        <div className={`app ${primaryFont.variable} ${secondaryFont.variable}`}>
          <Component {...pageProps} />
        </div>
      </PostDataProvider>
    </UserDataProvider>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
