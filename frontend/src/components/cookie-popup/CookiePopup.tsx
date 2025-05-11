import { CookieType } from '@/contexts/cookie-context';

type CookiePopupType = {
  setCookie: (cookie: CookieType) => void;
}

export const CookiePopup = ({ setCookie }: CookiePopupType) => {
  return (
    <dialog id="cookie-popup">
      <div className="cookie-panel">
        <p className="cookie-panel__text">YouTube want to track yo ass. If you accept they will create a bubble for you
          to try and capture your
          attention, hold it hostage to generate hella cash, bans, staccs, etc. No company gives you services for free.
          They harvest your data to feed algorithms that most likely steer you towards emotionally stimulating content
          so your lizard ass brain will keep clicking. Honestly close ur device and go lick some briccs or some
          shit.
          <br />
          <br />
          You might think you have nothing to hide but these companies have such vast amounts of data they know you
          more intimately than you know yourself. They can calculate with scary precision what you want next, you dont
          even know what you want. You might think you have free will but u aint, your thoughts are a thin veil over
          inner mechanics that you have no grasp on. You dont really know yourself but the algorithm does. At what point
          does the line get crossed where the algo conditioned more of your self-image than your real lyfe
          experience, that's some scary shit.</p>
        <div className="cookie-panel__button-group">
          <button className="primary" onClick={() => setCookie('decline')}>I still have hope, fuck these
            cookies
          </button>
          <button onClick={() => setCookie('accept')}>We're fucked anyhow, gimme the sweets bby</button>
        </div>
      </div>
    </dialog>
  );
};
