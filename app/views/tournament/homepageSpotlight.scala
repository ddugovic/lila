package views.html.tournament

import controllers.routes

import lila.api.Context
import lila.app.templating.Environment._
import lila.app.ui.ScalatagsTemplate._

object homepageSpotlight {

  def apply(tour: lila.tournament.Tournament)(implicit ctx: Context) = {
    val schedClass = tour.schedule ?? { sched =>
      val invert      = (sched.freq.isWeeklyOrBetter && tour.isNowOrSoon) ?? " invert"
      val highlighted = (tour.isStarted && !tour.isFinished) ?? " highlighted"
      val distant     = tour.isDistant ?? " distant little"
      s"${sched.freq} ${sched.speed} ${sched.variant.key}$invert$highlighted$distant ${ctx.currentSelectedColor}"
    }
    val tourClass = s"tour-spotlight id_${tour.id} $schedClass"
    tour.spotlight map { spot =>
      div(
        a(href := routes.Tournament.show(tour.id), cls := tourClass)(
          if (tour.isStarted && !tour.isFinished) span(cls := "ribbon")(span("live")),
          frag(
            spot.iconImg map { i =>
              img(cls := "img", src := staticAssetUrl(s"images/$i"))
            } getOrElse {
              spot.iconFont.fold[Frag](iconTag("g")(cls := "img")) {
                case "\\" => img(cls := "img icon", src := staticAssetUrl(s"images/globe.svg"))
                case i    => iconTag(i)(cls := "img")
              }
            },
            span(cls := "content")(
              span(cls := "name")(tour.name()),
              if (tour.isDistant) span(cls := "more")(momentFromNow(tour.startsAt))
              else
                frag(
                  span(cls := "headline")(spot.headline),
                  span(cls := "more")(
                    trans.nbPlayers.plural(tour.nbPlayers, tour.nbPlayers.localize),
                    " • ",
                    if (tour.isStarted) trans.finishesX(momentFromNow(tour.finishesAt))
                    else momentFromNow(tour.startsAt)
                  )
                )
            )
          )
        )
      )
    } getOrElse a(href := routes.Tournament.show(tour.id), cls := s"little $tourClass")(
      iconTag(tour.iconChar)(cls := "img"),
      span(cls := "content")(
        span(cls := "name")(tour.name()),
        span(cls := "more")(
          trans.nbPlayers.plural(tour.nbPlayers, tour.nbPlayers.localize),
          " • ",
          if (tour.isStarted) trans.eventInProgress() else momentFromNow(tour.startsAt)
        )
      )
    )
  }
}
