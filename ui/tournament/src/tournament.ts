import TournamentController from './ctrl';
import { init, classModule, attributesModule } from 'snabbdom';
import Draughtsground from 'draughtsground';
import { Chessground } from 'chessground';
import { TournamentOpts } from './interfaces';
import PlayStrategyChat from 'chat';

const patch = init([classModule, attributesModule]);

// eslint-disable-next-line no-duplicate-imports
import makeCtrl from './ctrl';
import view from './view/main';

export function isIn(ctrl: TournamentController) {
  return ctrl.data.me && !ctrl.data.me.withdraw;
}

export function willBePaired(ctrl: TournamentController) {
  return isIn(ctrl) && !ctrl.data.pairingsClosed;
}

export default function PlayStrategyTournament(opts: TournamentOpts) {
  $('body').data('tournament-id', opts.data.id);
  playstrategy.socket = new playstrategy.StrongSocket(
    `/tournament/${opts.data.id}/socket/v5`,
    opts.data.socketVersion,
    {
      receive: (t: string, d: any) => ctrl.socket.receive(t, d),
    },
  );
  opts.socketSend = playstrategy.socket.send;
  opts.element = document.querySelector('main.tour') as HTMLElement;
  opts.classes = opts.element.getAttribute('class');
  opts.$side = $('.tour__side').clone();
  opts.$faq = $('.tour__faq').clone();

  const ctrl = new makeCtrl(opts, redraw);

  const blueprint = view(ctrl);
  opts.element.innerHTML = '';
  let vnode = patch(opts.element, blueprint);

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }
}

// that's for the rest of playstrategy to access chessground
// without having to include it a second time
window.Chessground = Chessground;
window.Draughtsground = Draughtsground;
window.PlayStrategyChat = PlayStrategyChat;

(window as any).PlayStrategyTournament = PlayStrategyTournament; // esbuild
