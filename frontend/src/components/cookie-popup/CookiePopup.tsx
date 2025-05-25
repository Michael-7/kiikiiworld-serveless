import { CookieType } from '@/contexts/cookie-context';

type CookiePopupType = {
  setCookie: (cookie: CookieType) => void;
}

export const CookiePopup = ({ setCookie }: CookiePopupType) => {
  return (
    <dialog id="cookie-popup">
      <div className="cookie-panel">
        <p className="cookie-panel__text">YouTube wants to track yo ass. If you accept they will create a personal
          bubble to try and capture your attention and hold it hostage to generate hella cash, bans, staccs, etc. No
          company gives you services for free. They harvest your data to feed algorithms that steer you towards
          emotionally stimulating content so your lizard brain will keep clicking them lil buttons. Honestly please
          close ur device and go lick some briccs or some shit.
          <br />
          <br />
          You might think you have nothing to hide but these companies have such vast amounts of data they know you
          more intimately than you know yourself. They calculate with scary precision what you want next, while you dont
          even know what you want. You might think you have free will but u aint got none. Your thoughts are a thin veil
          over inner mechanics that you have no grasp on. You dont really know yourself but the algorithm does. At what
          point
          does the line get crossed where the algo conditioned more of your mind than your real lyfe experience,
          that&#39;s some scary shit.</p>
        <div className="cookie-panel__button-group">
          <button className="primary" onClick={() => setCookie('decline')}>
            I still have hope, fuck these cookies
          </button>
          <button onClick={() => setCookie('accept')}>We&#39;re fucked anyhow, gimme the sweets bby</button>
        </div>
      </div>
    </dialog>
  );
};
