import { h } from 'snabbdom';
import LobbyController from '../../ctrl';
import { bind } from 'common/snabbdom';
import { perfNames } from '../../constants';
import perfIcons from 'common/perfIcons';
import * as hookRepo from '../../hookRepo';
import { Hook } from '../../interfaces';

function renderHook(ctrl: LobbyController, hook: Hook) {
  const noarg = ctrl.trans.noarg;
  return h(
    'tr.hook.' + hook.action,
    {
      key: hook.id,
      class: { disabled: !!hook.disabled },
      attrs: {
        role: 'button',
        title: hook.disabled
          ? ''
          : hook.action === 'join'
            ? noarg('joinTheGame') + ' | ' + perfNames[hook.perf]
            : noarg('cancel'),
        'data-id': hook.id,
      },
    },
    [
      h(
        'td',
        hook.rating
          ? h('span.ulink.ulpt', { attrs: { 'data-href': '/@/' + hook.u } }, hook.u)
          : noarg('anonymous'),
      ),
      h('td', hook.rating && ctrl.opts.showRatings ? hook.rating + (hook.prov ? '?' : '') : ''),
      h('td', hook.clock),
      h(
        'td',
        h('span', { attrs: { 'data-icon': perfIcons[hook.perf] } }, noarg(hook.ra ? 'rated' : 'casual')),
      ),
    ],
  );
}

const isStandard = (value: boolean) => (hook: Hook) => (hook.variant === 'standard') === value;

const isMine = (hook: Hook) => hook.action === 'cancel';

const isNotMine = (hook: Hook) => !isMine(hook);

export const renderHookList = (ctrl: LobbyController, allHooks: Hook[]) => {
  const mine = allHooks.find(isMine),
    max = mine ? 13 : 14,
    hooks = allHooks.slice(0, max),
    render = (hook: Hook) => renderHook(ctrl, hook),
    standards = hooks.filter(isNotMine).filter(isStandard(true));
  hookRepo.sort(ctrl, standards);
  const variants = hooks
    .filter(isNotMine)
    .filter(isStandard(false))
    .slice(0, Math.max(0, max - standards.length - 1));
  hookRepo.sort(ctrl, variants);
  const renderedHooks = [
    ...standards.map(render),
    variants.length
      ? h('tr.variants', { key: 'variants' }, [
          h('td', { attrs: { colspan: 5 } }, '— ' + ctrl.trans('variant') + ' —'),
        ])
      : null,
    ...variants.map(render),
  ];
  if (mine) renderedHooks.unshift(render(mine));
  return h('table.hooks__list', [
    h(
      'thead',
      h('tr', [
        h('th'),
        h(
          'th',
          {
            class: { sortable: true, sort: ctrl.sort === 'rating' },
            hook: bind('click', _ => ctrl.setSort('rating'), ctrl.redraw),
          },
          [h('i.is'), ctrl.trans('rating')],
        ),
        h(
          'th',
          {
            class: { sortable: true, sort: ctrl.sort === 'time' },
            hook: bind('click', _ => ctrl.setSort('time'), ctrl.redraw),
          },
          [h('i.is'), ctrl.trans('time')],
        ),
        h('th', ctrl.trans('mode')),
      ]),
    ),
    h(
      'tbody',
      {
        class: { stepping: ctrl.stepping },
        hook: bind(
          'click',
          e => {
            let el = e.target as HTMLElement;
            do {
              el = el.parentNode as HTMLElement;
              if (el.nodeName === 'TR') return ctrl.clickHook(el.dataset['id']!);
            } while (el.nodeName !== 'TABLE');
          },
          ctrl.redraw,
        ),
      },
      renderedHooks,
    ),
  ]);
};