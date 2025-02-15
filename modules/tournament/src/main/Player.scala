package lila.tournament

import lila.common.LightUser
import lila.hub.LightTeam.TeamID
import lila.rating.PerfType
import lila.user.User

private[tournament] case class Player(
    _id: Player.ID, // random
    tourId: Tournament.ID,
    userId: User.ID,
    rating: Int,
    provisional: Boolean,
    inputRating: Option[Int] = None,
    isBot: Boolean = false,
    withdraw: Boolean = false,
    disqualified: Boolean = false,
    score: Int = 0,
    fire: Boolean = false,
    performance: Int = 0,
    playedGames: Boolean = false,
    team: Option[TeamID] = None
) {

  def id = _id

  def active = !withdraw

  def is(uid: User.ID): Boolean  = uid == userId
  def is(user: User): Boolean    = is(user.id)
  def is(other: Player): Boolean = is(other.userId)

  def actualRating = inputRating.getOrElse(rating)

  def doWithdraw = copy(withdraw = true)
  def unWithdraw = copy(withdraw = false)

  def magicScore = score * 100000 + (if (playedGames) 1 else 0) * 10000 + (performanceOption | actualRating)

  def performanceOption = performance > 0 option performance
}

private[tournament] object Player {

  type ID = String

  case class WithUser(player: Player, user: User)

  case class Result(player: Player, lightUser: LightUser, rank: Int)

  private[tournament] def make(
      tourId: Tournament.ID,
      user: User,
      perfType: PerfType,
      team: Option[TeamID],
      inputRating: Option[Int]
  ): Player =
    new Player(
      _id = lila.common.ThreadLocalRandom.nextString(8),
      tourId = tourId,
      userId = user.id,
      rating = user.perfs(perfType).intRating,
      provisional = user.perfs(perfType).provisional,
      inputRating = inputRating,
      isBot = user.isBot,
      team = team
    )
}
