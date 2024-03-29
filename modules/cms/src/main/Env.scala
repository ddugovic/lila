package lila.cms

import com.softwaremill.macwire.*

import lila.common.config.{ AssetBaseUrl, BaseUrl, CollName }
import lila.memo.CacheApi

@Module
final class Env(
    db: lila.db.Db,
    cacheApi: CacheApi,
    baseUrl: BaseUrl,
    assetBaseUrl: AssetBaseUrl,
    langList: lila.hub.i18n.LangList,
    langPicker: lila.hub.i18n.LangPicker
)(using Executor, Scheduler, play.api.Mode):

  private val coll = db(CollName("cms_page"))

  private val markup = wire[CmsMarkup]

  lazy val api = wire[CmsApi]

  val form = wire[CmsForm]