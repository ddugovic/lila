import { h, thunk, VNode, VNodeData } from 'snabbdom';

import AnalyseCtrl from './ctrl';
import { findTag } from './study/studyChapters';
import * as game from 'game';
import { defined } from 'common';
import { bind, dataIcon } from './util';

type AdviceKind = 'inaccuracy' | 'mistake' | 'blunder';

interface Advice {
  kind: AdviceKind;
  i18n: I18nKey;
  symbol: string;
}

function renderRatingDiff(rd: number | undefined): VNode | undefined {
  if (rd === 0) return h('span', '±0');
  if (rd && rd > 0) return h('good', '+' + rd);
  if (rd && rd < 0) return h('bad', '−' + -rd);
  return;
}

function renderPlayer(ctrl: AnalyseCtrl, playerIndex: PlayerIndex): VNode {
  const p = game.getPlayer(ctrl.data, playerIndex);
  if (p.user)
    return h(
      'a.user-link.ulpt',
      {
        attrs: { href: '/@/' + p.user.username },
      },
      [p.user.username, ' ', renderRatingDiff(p.ratingDiff)],
    );
  return h(
    'span',
    p.name ||
      (p.ai && 'Stockfish level ' + p.ai) ||
      (ctrl.study && findTag(ctrl.study.data.chapter.tags, playerIndex)) ||
      'Anonymous',
  );
}

const advices: Advice[] = [
  { kind: 'inaccuracy', i18n: 'nbInaccuracies', symbol: '?!' },
  { kind: 'mistake', i18n: 'nbMistakes', symbol: '?' },
  { kind: 'blunder', i18n: 'nbBlunders', symbol: '??' },
];

function playerTable(ctrl: AnalyseCtrl, playerIndex: PlayerIndex): VNode {
  const d = ctrl.data;
  const acpl = d.analysis![playerIndex].acpl;
  return h('div.advice-summary__side', [
    //TODO: when analyse has different game families it should use playerColor not playerIndex
    h('div.advice-summary__player', [h(`i.is.playerIndex-icon.${playerIndex}`), renderPlayer(ctrl, playerIndex)]),
    ...advices.map(a => {
      const nb: number = d.analysis![playerIndex][a.kind];
      const attrs: VNodeData = nb
        ? {
            'data-playerindex': playerIndex,
            'data-symbol': a.symbol,
          }
        : {};
      return h(
        `div.advice-summary__mistake${nb ? '.symbol' : ''}`,
        { attrs },
        ctrl.trans.vdomPlural(a.i18n, nb, h('strong', nb)),
      );
    }),
    h('div.advice-summary__acpl', [
      h('strong', '' + (defined(acpl) ? acpl : '?')),
      h('span', ctrl.trans.noarg('averageCentipawnLoss')),
    ]),
  ]);
}

function doRender(ctrl: AnalyseCtrl): VNode {
  return h(
    'div.advice-summary',
    {
      hook: {
        insert: vnode => {
          $(vnode.elm as HTMLElement).on('click', 'div.symbol', function (this: Element) {
            ctrl.jumpToGlyphSymbol($(this).data('playerIndex'), $(this).data('symbol'));
          });
        },
      },
    },
    [
      playerTable(ctrl, 'p1'),
      ctrl.study
        ? null
        : h(
            'a.button.text',
            {
              class: { active: !!ctrl.retro },
              attrs: dataIcon('G'),
              hook: bind('click', ctrl.toggleRetro, ctrl.redraw),
            },
            ctrl.trans.noarg('learnFromYourMistakes'),
          ),
      playerTable(ctrl, 'p2'),
    ],
  );
}

export function render(ctrl: AnalyseCtrl): VNode | undefined {
  if (ctrl.studyPractice || ctrl.embed) return;

  if (!ctrl.data.analysis || !ctrl.showComputer() || (ctrl.study && ctrl.study.vm.toolTab() !== 'serverEval'))
    return h('div.analyse__acpl');

  // don't cache until the analysis is complete!
  const buster = ctrl.data.analysis.partial ? Math.random() : '';
  let cacheKey = '' + buster + !!ctrl.retro;
  if (ctrl.study) cacheKey += ctrl.study.data.chapter.id;

  return h('div.analyse__acpl', thunk('div.advice-summary', doRender, [ctrl, cacheKey]));
}
